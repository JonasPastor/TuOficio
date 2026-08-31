@echo off
echo Configurando Java para el proyecto...

REM Buscar Java en ubicaciones comunes
for /d %%i in ("C:\Program Files\Microsoft\jdk*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        goto :found
    )
)

for /d %%i in ("C:\Program Files\Java\jdk*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        goto :found
    )
)

for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        goto :found
    )
)

echo Java no encontrado. Por favor instala Java 17 primero.
echo Puedes descargarlo desde: https://adoptium.net/temurin/releases/?version=17
pause
exit /b 1

:found
echo Java encontrado en: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Verificando instalacion...
java -version
echo.

echo Ejecutando Maven...
mvnw.cmd clean install -U

pause
