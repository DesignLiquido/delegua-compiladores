$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

$diretorioCompiladores = Split-Path -Parent $MyInvocation.MyCommand.Path

# Configurando Git para usar UTF-8 nas mensagens de commit.
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# O .npmrc do repositório referencia ${NPM_TOKEN}. Se não estiver definido no
# ambiente, o yarn falha ao ler a configuração ao instalar dependências. Lemos
# o token do perfil global do npm para evitar pedir ao usuário caso já tenha
# autenticado via `npm config set` ou `npm login`.
if (-not $env:NPM_TOKEN) {
    $tokenGlobal = npm config get //registry.npmjs.org/:_authToken 2>$null
    if ($tokenGlobal -and $tokenGlobal -ne "undefined") {
        $env:NPM_TOKEN = $tokenGlobal
    } else {
        $env:NPM_TOKEN = Read-Host "NPM Token para autenticação (npm_...)"
    }
}

Set-Location -Path $diretorioCompiladores
git pull
yarn

yarn empacotar
if ($LastExitCode -ne 0) {
    Write-Host "Empacotamento falhou. Favor verificar."
    exit 1
}

yarn testes-unitarios
if ($LastExitCode -ne 0) {
    Write-Host "Testes unitários falharam. Favor verificar."
    exit 1
}

# NPM passou a exigir OTP em todo `npm publish`, mesmo com token do tipo
# Automation (endurecimento pós-ataques de supply chain de 2025). --ci
# desliga prompts interativos do release-it, então sem OTP explícito ele
# falha com EOTP silenciosamente (sem quebrar o script).
# O release-it usa "npm: false" + @release-it-plugins/workspaces para
# publicar os pacotes, então o OTP deve chegar via NPM_CONFIG_OTP
# (reconhecido pelo npm em qualquer chamada interna a `npm publish`).
$otp = Read-Host "Código OTP do NPM para publicar os compiladores Delégua"
$env:NPM_CONFIG_OTP = $otp
yarn release-it --ci
$resultadoRelease = $LastExitCode
Remove-Item Env:\NPM_CONFIG_OTP -ErrorAction SilentlyContinue

if ($resultadoRelease -ne 0) {
    Write-Host "Publicação no NPM falhou (OTP inválido/expirado ou outro erro). Favor verificar e publicar manualmente se necessário."
}
