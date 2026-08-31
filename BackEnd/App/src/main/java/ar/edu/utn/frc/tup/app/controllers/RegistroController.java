package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.auth.AuthResponse;
import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.registro.ProfesionalRequest;
import ar.edu.utn.frc.tup.app.dtos.request.registro.UsuarioRequest;
import ar.edu.utn.frc.tup.app.services.ConfirmationTokenService;
import ar.edu.utn.frc.tup.app.services.RegistroService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/registro")
@Tag(name="Registro")
@RequiredArgsConstructor
public class RegistroController {

    private final RegistroService registroService;
    private final ConfirmationTokenService confirmationTokenService;

    @PostMapping("/usuario")
    public ResponseEntity<AuthResponse> registrarUsuario(@RequestBody UsuarioRequest usuario) {
        return ResponseEntity.ok(registroService.registrarUsuario(usuario));
    }

    @PostMapping("/profesional")
    public ResponseEntity<?> registrarProfesional(@RequestBody ProfesionalRequest profesionalRequest){
        try{
            return ResponseEntity.status(HttpStatus.CREATED).body(registroService.registrarProfesional(profesionalRequest));
        } catch (RuntimeException e){
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/administrador")
    public ResponseEntity<AuthResponse> registrarAdministrador(@RequestBody UsuarioRequest administrador) {
        return ResponseEntity.ok(registroService.registrarAdministrador(administrador));

    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmarCuenta(@RequestParam("token") String token) {
        try {
            confirmationTokenService.confirmToken(token);

            String htmlContent = loadConfirmationSuccessPage();

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(htmlContent);
        } catch (Exception e) {
            String errorHtml = createErrorPage("Token inválido o expirado: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml);
        }
    }

    private String loadConfirmationSuccessPage() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email-confirmed.html");
            String htmlTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            String loginUrl = "http://localhost:4200/login";
            String homeUrl = "http://localhost:4200/";

            return htmlTemplate
                    .replace("{{loginUrl}}", loginUrl)
                    .replace("{{homeUrl}}", homeUrl);

        } catch (IOException e) {
            return createFallbackSuccessPage();
        }
    }

    private String createFallbackSuccessPage() {
        return """
                <html>
                <head>
                    <title>Cuenta Confirmada</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                        .success { color: #27ae60; font-size: 24px; margin-bottom: 20px; }
                        .btn { display: inline-block; padding: 12px 25px; margin: 10px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✅ ¡Cuenta Confirmada Exitosamente!</div>
                        <p>Tu email ha sido verificado correctamente.</p>
                        <a href="http://localhost:4200/login" class="btn">Iniciar Sesión</a>
                    </div>
                </body>
                </html>
                """;
    }

    private String createErrorPage(String errorMessage) {
        return """
                <html>
                <head>
                    <title>Error de Confirmación</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; }
                        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                        .error { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
                        .btn { display: inline-block; padding: 12px 25px; margin: 10px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error">❌ Error de Confirmación</div>
                        <p>%s</p>
                        <a href="http://localhost:4200/" class="btn">Volver al Inicio</a>
                    </div>
                </body>
                </html>
                """.formatted(errorMessage);
    }
}
