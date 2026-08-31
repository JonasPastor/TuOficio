package ar.edu.utn.frc.tup.app.services;

public interface ConfirmationTokenService {
    String createTokenForAuth(Integer authId);
    void confirmToken(String token);
}
