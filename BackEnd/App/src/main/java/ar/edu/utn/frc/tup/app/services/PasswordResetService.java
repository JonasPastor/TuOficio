package ar.edu.utn.frc.tup.app.services;

import org.springframework.stereotype.Service;

@Service
public interface PasswordResetService {
    public void solicitarRecuperacion(String email);
    public void cambiarPassword(String email, String codigo, String nuevaPassword);
    public boolean isValidToken(String email, String token);
}
