package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.auth.AuthResponse;
import ar.edu.utn.frc.tup.app.dtos.request.registro.ProfesionalRequest;
import ar.edu.utn.frc.tup.app.dtos.request.registro.UsuarioRequest;
import ar.edu.utn.frc.tup.app.entities.Profesionale;
import org.springframework.stereotype.Service;

@Service
public interface RegistroService {
    AuthResponse registrarUsuario(UsuarioRequest usuario);
    Profesionale registrarProfesional(ProfesionalRequest profesionalRequest);
    AuthResponse registrarAdministrador(UsuarioRequest adminRequest);
}
