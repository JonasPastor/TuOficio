package ar.edu.utn.frc.tup.app.dtos.response.resenia;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReseniaUser {
    private Integer id;
    private String nombreUsuario;
    private Integer puntuacion;
    private String comentario;
    private Instant fecha;
    private String servicio;
}
