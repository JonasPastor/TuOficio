package ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioMetrica {
    private String nombre;
    private String email;
    private Integer strikes;
    private Boolean estado;
}
