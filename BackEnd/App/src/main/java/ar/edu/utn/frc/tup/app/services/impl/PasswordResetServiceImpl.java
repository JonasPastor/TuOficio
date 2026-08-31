package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.entities.Auth;
import ar.edu.utn.frc.tup.app.entities.PasswordResetToken;
import ar.edu.utn.frc.tup.app.repositories.AuthRepository;
import ar.edu.utn.frc.tup.app.repositories.PasswordResetTokenRepository;
import ar.edu.utn.frc.tup.app.services.EmailService;
import ar.edu.utn.frc.tup.app.services.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Random;

@Service
@Slf4j // Para logs
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;

    private final AuthRepository authRepository;

    private final EmailService emailService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void solicitarRecuperacion(String email) {
        try {
            log.info("Iniciando recuperación para email: {}", email);

            Auth usuario = authRepository.findByMail(email)
                    .orElseThrow(() -> {
                        log.error("Usuario no encontrado: {}", email);
                        return new RuntimeException("Email no encontrado");
                    });

            log.info("Usuario encontrado: {}", usuario.getId());

            String codigo = String.format("%06d", new Random().nextInt(999999));
            log.info("Código generado para {}: {}", email, codigo);

            PasswordResetToken token = new PasswordResetToken();
            token.setToken(codigo);
            token.setEmail(email);
            token.setExpiryDate(Instant.now().plusSeconds(15 * 60));
            tokenRepository.findByEmailAndTokenAndUsedFalseAndExpiryDateAfter(
                    email, codigo, Instant.now());


            token.setUsed(false);

            PasswordResetToken savedToken = tokenRepository.save(token);
            log.info("Token guardado con ID: {}", savedToken.getId());

            String resetLink = "http://localhost:8081/auth/reset-password?token=" + codigo + "&email=" + email;

            String htmlBody = loadPasswordResetEmailTemplate(codigo, resetLink);
            emailService.sendHtml(email, "Recuperación de Contraseña - Tu Oficio", htmlBody);
            log.info("Email HTML enviado exitosamente a: {}", email);

        } catch (Exception e) {
            log.error("Error en solicitarRecuperacion: ", e);
            throw new RuntimeException("Error procesando solicitud: " + e.getMessage(), e);
        }
    }

    @Override
    public void cambiarPassword(String email, String codigo, String nuevaPassword) {
        try {
            log.info("Intentando cambiar password para: {}", email);

            PasswordResetToken token = tokenRepository
                    .findByEmailAndTokenAndUsedFalseAndExpiryDateAfter(
                            email, codigo, Instant.now())
                    .orElseThrow(() -> {
                        log.error("Token inválido o expirado para: {}", email);
                        return new RuntimeException("Código inválido o expirado");
                    });

            Auth usuario = authRepository.findByMail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            usuario.setPassword(passwordEncoder.encode(nuevaPassword));
            authRepository.save(usuario);

            token.setUsed(true);
            tokenRepository.save(token);

            log.info("Password cambiado exitosamente para: {}", email);

        } catch (Exception e) {
            log.error("Error cambiando password: ", e);
            throw new RuntimeException("Error cambiando password: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isValidToken(String email, String token) {
        try {
            log.info("Validando token para: {}", email);

            return tokenRepository
                    .findByEmailAndTokenAndUsedFalseAndExpiryDateAfter(
                            email, token, Instant.now())
                    .isPresent();

        } catch (Exception e) {
            log.error("Error validando token para {}: ", email, e);
            return false;
        }
    }

    private String loadPasswordResetEmailTemplate(String resetCode, String resetLink) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email-password-reset.html");
            String htmlTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            return htmlTemplate
                    .replace("{{resetCode}}", resetCode)
                    .replace("{{resetLink}}", resetLink);

        } catch (IOException e) {
            log.error("Error cargando template HTML, usando fallback: ", e);
            return createFallbackEmailTemplate(resetCode, resetLink);
        }
    }

    private String createFallbackEmailTemplate(String resetCode, String resetLink) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #e74c3c; text-align: center;">🔧 Tu Oficio - Recuperación de Contraseña</h2>
                        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                        
                        <div style="background-color: #f39c12; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; letter-spacing: 2px;">
                            %s
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background-color: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Restablecer Contraseña
                            </a>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404;">
                            <strong>⚠️ Importante:</strong> Este código expira en 15 minutos por motivos de seguridad.
                        </div>
                        
                        <p style="font-size: 12px; color: #666; text-align: center;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    </div>
                </body>
                </html>
                """.formatted(resetCode, resetLink);
    }
}