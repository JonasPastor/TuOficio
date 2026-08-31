package ar.edu.utn.frc.tup.app.dtos.response.resenia;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReseniaResponse {
    private String nombreUsuario;
    private String nombreProfesional;
    private Instant fecha;
    private Integer puntuacion;
    private String comentario;
}
