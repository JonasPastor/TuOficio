package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.request.perfil.ModificarCliente;
import ar.edu.utn.frc.tup.app.dtos.request.perfil.ModificarProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.UsuariosRegistradosDto;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilCliente;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica.ProfesionalMetrica;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica.UsuarioMetrica;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PerfilService {
    PerfilCliente getPerfilCliente(Integer idCliente);
    PerfilCliente updatePerfilCliente(ModificarCliente cliente, String authHeader);
    PerfilProfesional getPerfilProfesional(Integer idProfesional);
    PerfilProfesional updatePerfilProfesional(ModificarProfesional profesional);
    void updateAvatar(Integer idAuth, String avatarUrl);
    void updateAvatarByUsuarioId(Integer idUsuario, String avatarUrl);
    String getAvatar(Integer idAuth);
    String getAvatarByUsuarioId(Integer idUsuario);
    List<PerfilProfesional> getProfesionalesByOficio(String oficio);
    void agregarStrike(String email, String motivo);
    List<UsuarioMetrica> getUsuariosMetrica(Integer limit, Integer offset);
    List<ProfesionalMetrica> getProfesionalesMetrica(Integer limit, Integer offset);
    UsuariosRegistradosDto getUsuariosRegistrados();
    List<PerfilCliente> getClientesByNombre(String nombre);
    List<PerfilProfesional> getProfesionalesByNombre(String nombre);
}
