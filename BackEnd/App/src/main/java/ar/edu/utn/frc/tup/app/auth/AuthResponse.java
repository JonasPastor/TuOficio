package ar.edu.utn.frc.tup.app.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    String token;
    private String nombre;
    private String apellido;
    private String email;
    private Integer idUsuario;
    private String documento;
    private String telefono;
    private String nacimiento;
    private Integer idDireccion;
    private Integer idProfesional;
    private List<String> roles;
    private String avatar;
}
