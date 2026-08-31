package ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfesionalMetrica {
    private String nombre;
    private String oficio;
    private String calificacion;
    private Integer serviciosCompletados;
}
