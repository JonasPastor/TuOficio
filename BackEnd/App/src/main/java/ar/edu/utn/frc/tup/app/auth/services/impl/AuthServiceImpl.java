package ar.edu.utn.frc.tup.app.auth.services.impl;

import ar.edu.utn.frc.tup.app.auth.AuthResponse;
import ar.edu.utn.frc.tup.app.auth.LoginRequest;
import ar.edu.utn.frc.tup.app.auth.RegisterRequest;
import ar.edu.utn.frc.tup.app.auth.services.AuthService;
import ar.edu.utn.frc.tup.app.auth.services.JwtService;
import ar.edu.utn.frc.tup.app.entities.Auth;
import ar.edu.utn.frc.tup.app.entities.Usuario;
import ar.edu.utn.frc.tup.app.repositories.AuthRepository;
import ar.edu.utn.frc.tup.app.repositories.UsuarioRepository;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.repositories.RolxusuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final ProfesionalRepository profesionalRepository;
    private final RolxusuarioRepository rolxusuarioRepository;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        Auth auth = authRepository.findByMail(request.getEmail()).orElseThrow();
        Usuario usuario = usuarioRepository.findByIdauth(auth).orElse(null);

        Integer idProfesional = null;
        if (usuario != null) {
            idProfesional = profesionalRepository.findByIdusuario_Id(usuario.getId())
                    .map(p -> p.getId())
                    .orElse(null);
        }

        List<String> roles = rolxusuarioRepository.findByIdauth(auth).stream()
                .map(rolxusuario -> rolxusuario.getIdrol().getDescripcion())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwtService.getToken(auth))
                .nombre(auth.getName())
                .apellido(auth.getLastname())
                .email(auth.getMail())
                .idUsuario(usuario != null ? usuario.getId() : null)
                .documento(usuario != null ? usuario.getDocumento() : null)
                .telefono(usuario != null ? usuario.getTelefono() : null)
                .nacimiento(usuario != null && usuario.getNacimiento() != null ? usuario.getNacimiento().toString() : null)
                .idDireccion(usuario != null ? usuario.getIddireccion().getId() : null)
                .idProfesional(idProfesional)
                .roles(roles)
                .avatar(usuario != null ? usuario.getAvatar() : null)
             .build();
    }
    @Override
    public AuthResponse register(RegisterRequest request) {
        Auth usuario = Auth.builder()
                .password(passwordEncoder.encode(request.getPassword()))
                .mail(request.getEmail())
                .name(request.getName())
                .lastname(request.getLastname())
                .active(true) //Todo revisar
                .build();

        authRepository.save(usuario);

        return AuthResponse.builder()
                .token(jwtService.getToken(usuario))
                .build();
    }
}
