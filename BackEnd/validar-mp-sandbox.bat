@echo off
REM Script de validación de configuración MercadoPago Sandbox
REM Ejecutar desde la raíz del proyecto BackPs

echo ========================================
echo   VALIDACION MERCADOPAGO SANDBOX
echo ========================================
echo.

echo [1/4] Verificando archivo .env...
if exist .env (
    echo [OK] Archivo .env encontrado
    findstr /C:"MERCADOPAGO_ACCESS_TOKEN=TEST-" .env >nul
    if %errorlevel%==0 (
        echo [OK] Access Token es de SANDBOX (TEST-)
    ) else (
        echo [ERROR] Access Token NO es de sandbox. Debe empezar con TEST-
        goto :error
    )
) else (
    echo [ERROR] Archivo .env no encontrado
    goto :error
)

echo.
echo [2/4] Verificando application.yml...
if exist App\src\main\resources\application.yml (
    echo [OK] application.yml encontrado
    findstr /C:"mercadopago:" App\src\main\resources\application.yml >nul
    if %errorlevel%==0 (
        echo [OK] Configuración de MercadoPago presente
    ) else (
        echo [WARN] No se encontró configuración de MercadoPago
    )
) else (
    echo [ERROR] application.yml no encontrado
    goto :error
)

echo.
echo [3/4] Verificando archivo HTML de prueba...
if exist App\src\main\resources\static\mp-checkout.html (
    echo [OK] mp-checkout.html encontrado
) else (
    echo [ERROR] mp-checkout.html no encontrado
    goto :error
)

echo.
echo [4/4] Verificando PagoController...
if exist App\src\main\java\ar\edu\utn\frc\tup\app\controllers\PagoController.java (
    echo [OK] PagoController.java encontrado
    findstr /C:"@GetMapping(\"/mode\")" App\src\main\java\ar\edu\utn\frc\tup\app\controllers\PagoController.java >nul
    if %errorlevel%==0 (
        echo [OK] Endpoint /mode implementado
    ) else (
        echo [WARN] Endpoint /mode no encontrado
    )
) else (
    echo [ERROR] PagoController.java no encontrado
    goto :error
)

echo.
echo ========================================
echo   VALIDACION COMPLETADA CON EXITO
echo ========================================
echo.
echo Proximos pasos:
echo 1. Inicia la aplicacion: cd App ^&^& mvnw spring-boot:run
echo 2. Abre http://localhost:8081/mp-checkout.html
echo 3. Verifica configuracion con el boton "Verificar configuracion"
echo 4. Crea una preferencia y paga en ventana incognito
echo 5. Usa tarjeta de prueba: 4509 9535 6623 3704, CVV 123, Venc. 11/25, Titular APRO
echo.
echo Documentacion completa: INSTRUCCIONES_SANDBOX_MP.md
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo   ERROR EN VALIDACION
echo ========================================
echo.
echo Por favor revisa los archivos mencionados y vuelve a ejecutar este script.
echo.
pause
exit /b 1

