@echo off
echo ========================================
echo   Configurador de Java para BackPs
echo ========================================
echo.

echo Buscando Java en el sistema...

REM Verificar si java está en PATH
where java >nul 2>&1
if %errorlevel% == 0 (
    echo Java encontrado en PATH!
    java -version
    echo.
    goto :run_maven
)

REM Buscar en ubicaciones comunes de Microsoft OpenJDK
if exist "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot"
    goto :found
)

REM Buscar en ubicaciones de Eclipse Adoptium
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        goto :found
    )
)

REM Buscar en ubicaciones Oracle
for /d %%i in ("C:\Program Files\Java\jdk-17*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        goto :found
    )
)

echo.
echo ERROR: Java 17 no encontrado en el sistema.
echo.
echo Por favor:
echo 1. Descarga Java 17 desde: https://adoptium.net/temurin/releases/?version=17
echo 2. Instala el archivo .msi como administrador
echo 3. Ejecuta este script nuevamente
echo.
pause
exit /b 1

:found
echo Java encontrado en: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo JAVA_HOME configurado: %JAVA_HOME%
echo.

echo Verificando version de Java...
"%JAVA_HOME%\bin\java" -version
echo.

:run_maven
echo Ejecutando Maven clean install...
echo.
mvnw.cmd clean install -U

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   BUILD EXITOSO!
    echo ========================================
    echo.
    echo La aplicacion esta lista para ejecutarse.
    echo Ahora puedes ejecutar tu aplicacion Spring Boot.
) else (
    echo.
    echo ========================================
    echo   ERROR EN BUILD
    echo ========================================
    echo.
    echo Revisa los errores mostrados arriba.
)

echo.
pause
