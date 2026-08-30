@echo off
setlocal enabledelayedexpansion

rem ---------------------------------------------------------------
rem  Shorts Creator - sobe o servidor local e abre o navegador.
rem
rem  Pode ser executado com duplo clique de qualquer lugar: o cd /d
rem  abaixo leva para a pasta do proprio .bat, entao serve.py e
rem  index.html sao encontrados mesmo que o atalho esteja na area
rem  de trabalho.
rem
rem  Uso:  iniciar.bat  [porta]     (padrao 8777)
rem ---------------------------------------------------------------

cd /d "%~dp0"

set "PORTA=8777"
if not "%~1"=="" set "PORTA=%~1"

if not exist "serve.py" (
  echo.
  echo  [ERRO] Nao achei serve.py em: %cd%
  echo  Deixe este .bat na mesma pasta do serve.py e do index.html.
  echo.
  pause
  exit /b 1
)

rem -- procura o Python: "py" e o lancador oficial e costuma existir --
set "PY="
where py >nul 2>&1 && set "PY=py"
if not defined PY (
  where python >nul 2>&1 && set "PY=python"
)
if not defined PY (
  echo.
  echo  [ERRO] Python nao encontrado no PATH.
  echo  Instale em https://python.org/downloads e marque
  echo  "Add Python to PATH" durante a instalacao.
  echo.
  pause
  exit /b 1
)

rem -- se a porta ja responde, o servidor esta no ar: so abre o navegador --
powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',%PORTA%);$c.Close();exit 0}catch{exit 1}" >nul 2>&1
if not errorlevel 1 (
  echo.
  echo  Ja existe um servidor na porta %PORTA% - abrindo o navegador.
  echo  Para reiniciar, feche a janela do servidor antes.
  echo.
  start "" "http://localhost:%PORTA%"
  rem  ping em vez de timeout: o timeout aborta com "redirecionamento de
  rem  entrada nao suportado" quando o .bat e chamado com stdin redirecionado
  ping -n 4 127.0.0.1 >nul 2>&1
  exit /b 0
)

rem -- abre o navegador so DEPOIS que a porta aceitar conexao --
rem    (abrir antes daria pagina de erro; este vigia espera ate 15s)
start "" /min powershell -NoProfile -Command ^
  "for($i=0;$i -lt 60;$i++){try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',%PORTA%);$c.Close();Start-Process 'http://localhost:%PORTA%';exit}catch{Start-Sleep -Milliseconds 250}}"

echo.
echo  ============================================
echo    Shorts Creator
echo    http://localhost:%PORTA%
echo.
echo    O navegador abre sozinho em instantes.
echo    DEIXE ESTA JANELA ABERTA enquanto usa:
echo    ela e o servidor e o proxy da Replicate.
echo    Ctrl+C ou fechar a janela para parar.
echo  ============================================
echo.

rem -- servidor em primeiro plano: os logs aparecem aqui e Ctrl+C funciona --
%PY% serve.py %PORTA%

echo.
echo  Servidor encerrado.
pause
