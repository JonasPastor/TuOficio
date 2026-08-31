package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.entities.Auth;
import ar.edu.utn.frc.tup.app.entities.ConfirmationToken;
import ar.edu.utn.frc.tup.app.repositories.AuthRepository;
import ar.edu.utn.frc.tup.app.repositories.ConfirmationTokenRepository;
import ar.edu.utn.frc.tup.app.services.ConfirmationTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConfirmationTokenServiceImpl implements ConfirmationTokenService {

    private final ConfirmationTokenRepository tokenRepository;
    private final AuthRepository authRepository;

    @Override
    public String createTokenForAuth(Integer authId) {
        Auth auth = authRepository.findById(authId)
                .orElseThrow(() -> new RuntimeException("Auth no encontrado"));
        String token = UUID.randomUUID().toString();
        ConfirmationToken confirmationToken = ConfirmationToken.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .auth(auth)
                .build();
        tokenRepository.save(confirmationToken);
        return token;
    }

    @Override
    public void confirmToken(String token) {
        ConfirmationToken confirmationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token no encontrado"));
        if (confirmationToken.getConfirmedAt() != null) {
            throw new RuntimeException("Token ya confirmado");
        }
        if (confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }
        confirmationToken.setConfirmedAt(LocalDateTime.now());
        Auth auth = confirmationToken.getAuth();
        auth.setActive(true);
        authRepository.save(auth);
        tokenRepository.save(confirmationToken);
    }
}
