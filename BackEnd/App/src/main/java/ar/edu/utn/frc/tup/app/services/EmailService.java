package ar.edu.utn.frc.tup.app.services;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void enviarCodigoRecuperacion(String email, String codigo);
    void send(String to, String subject, String body);
    void sendHtml(String to, String subject, String htmlBody);
}
