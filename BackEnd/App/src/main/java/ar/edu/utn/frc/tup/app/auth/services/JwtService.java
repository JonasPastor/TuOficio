package ar.edu.utn.frc.tup.app.auth.services;

import ar.edu.utn.frc.tup.app.entities.Usuario;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public interface JwtService {
    String getToken(UserDetails usuario);

    String getUsernameFromToken(String token);

    boolean isTokenValid(String token, UserDetails userDetails);
}
