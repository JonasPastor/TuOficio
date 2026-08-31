package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.request.ForgotPasswordRequest;
import ar.edu.utn.frc.tup.app.dtos.request.ResetPasswordRequest;
import ar.edu.utn.frc.tup.app.services.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody ForgotPasswordRequest request) {
        try {
            logger.info("Recibida solicitud de recuperación para: {}", request.getEmail());

            passwordResetService.solicitarRecuperacion(request.getEmail());

            return ResponseEntity.ok(Map.of("mensaje", "Código enviado al email"));

        } catch (Exception e) {
            logger.error("Error en endpoint forgot-password: ", e);

            // Retornar error específico para debug
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Error al enviar código",
                            "detalle", e.getMessage(),
                            "tipo", e.getClass().getSimpleName()
                    ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.cambiarPassword(
                    request.getEmail(),
                    request.getCodigo(),
                    request.getNuevaPassword()
            );
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña cambiada exitosamente"));
        } catch (Exception e) {
            logger.error("Error en endpoint reset-password: ", e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Error al cambiar contraseña",
                            "detalle", e.getMessage()
                    ));
        }
    }

    @GetMapping("/reset-password")
    public ResponseEntity<String> mostrarPaginaReset(
            @RequestParam("token") String token,
            @RequestParam("email") String email) {
        try {
            if (!passwordResetService.isValidToken(email, token)) {
                String errorHtml = loadPasswordResetPage(email, token, true, "Token inválido o expirado", false, null);
                return ResponseEntity.badRequest()
                        .contentType(MediaType.TEXT_HTML)
                        .body(errorHtml);
            }

            String htmlContent = loadPasswordResetPage(email, token, false, null, true, null);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(htmlContent);

        } catch (Exception e) {
            logger.error("Error mostrando página de reset: ", e);
            String errorHtml = createErrorResetPage("Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml);
        }
    }

    @PostMapping("/reset-password-form")
    public ResponseEntity<String> procesarFormularioReset(
            @RequestParam("token") String token,
            @RequestParam("email") String email,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword) {
        try {
            if (!newPassword.equals(confirmPassword)) {
                String errorHtml = loadPasswordResetPage(email, token, true, "Las contraseñas no coinciden", true, null);
                return ResponseEntity.badRequest()
                        .contentType(MediaType.TEXT_HTML)
                        .body(errorHtml);
            }

            passwordResetService.cambiarPassword(email, token, newPassword);

            String successHtml = loadPasswordResetPage(email, token, false, null, false, "Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.");
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(successHtml);

        } catch (Exception e) {
            logger.error("Error procesando formulario de reset: ", e);
            String errorHtml = loadPasswordResetPage(email, token, true, "Error al cambiar contraseña: " + e.getMessage(), true, null);
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml);
        }
    }

    private String loadPasswordResetPage(String email, String token, boolean showError, String errorMessage, boolean showForm, String successMessage) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/password-reset.html");
            String htmlTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            return htmlTemplate
                    .replace("{{formAction}}", "/auth/reset-password-form")
                    .replace("{{resetToken}}", token != null ? token : "")
                    .replace("{{userEmail}}", email != null ? email : "")
                    .replace("{{showError}}", showError ? "block" : "none")
                    .replace("{{errorMessage}}", errorMessage != null ? errorMessage : "")
                    .replace("{{showSuccess}}", successMessage != null ? "block" : "none")
                    .replace("{{successMessage}}", successMessage != null ? successMessage : "")
                    .replace("{{showForm}}", showForm ? "block" : "none")
                    .replace("{{loginUrl}}", "http://localhost:4200/login")
                    .replace("{{supportUrl}}", "http://localhost:4200/support");

        } catch (IOException e) {
            return createFallbackResetPage(email, token, showError, errorMessage, showForm, successMessage);
        }
    }

    private String createFallbackResetPage(String email, String token, boolean showError, String errorMessage, boolean showForm, String successMessage) {
        String errorDiv = showError ?
            "<div style='background-color: #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px; color: #8b4513;'>" + errorMessage + "</div>" : "";

        String successDiv = successMessage != null ?
            "<div style='background-color: #d4edda; padding: 15px; border-radius: 5px; margin-bottom: 20px; color: #155724;'>" + successMessage + "</div>" : "";

        String formDiv = showForm ? """
            <form action="/auth/reset-password-form" method="POST">
                <input type="hidden" name="token" value="%s">
                <input type="hidden" name="email" value="%s">
                <div style="margin-bottom: 20px;">
                    <label>Nueva Contraseña:</label>
                    <input type="password" name="newPassword" required minlength="8" style="width: 100%%; padding: 10px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label>Confirmar Contraseña:</label>
                    <input type="password" name="confirmPassword" required minlength="8" style="width: 100%%; padding: 10px; margin-top: 5px;">
                </div>
                <button type="submit" style="width: 100%%; padding: 15px; background-color: #3498db; color: white; border: none; border-radius: 5px;">
                    Cambiar Contraseña
                </button>
            </form>
            """.formatted(token, email) : "";

        return """
            <html>
            <head>
                <title>Restablecer Contraseña</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background-color: #f8f9fa; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .title { color: #2c3e50; text-align: center; margin-bottom: 20px; }
                    .btn { display: block; width: 100%%; padding: 12px; margin: 10px 0; text-decoration: none; text-align: center; border-radius: 5px; }
                    .btn-secondary { background-color: #ecf0f1; color: #2c3e50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2 class="title">🔧 Tu Oficio - Restablecer Contraseña</h2>
                    %s
                    %s
                    %s
                    <a href="http://localhost:4200/login" class="btn btn-secondary">Volver al Login</a>
                </div>
            </body>
            </html>
            """.formatted(errorDiv, successDiv, formDiv);
    }

    private String createErrorResetPage(String errorMessage) {
        return """
            <html>
            <head>
                <title>Error - Restablecer Contraseña</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; }
                    .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                    .error { color: #e74c3c; font-size: 20px; margin-bottom: 20px; }
                    .btn { display: inline-block; padding: 12px 25px; margin: 10px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">❌ Error</div>
                    <p>%s</p>
                    <a href="http://localhost:4200/forgot-password" class="btn">Solicitar Nuevo Código</a>
                </div>
            </body>
            </html>
            """.formatted(errorMessage);
    }
}
