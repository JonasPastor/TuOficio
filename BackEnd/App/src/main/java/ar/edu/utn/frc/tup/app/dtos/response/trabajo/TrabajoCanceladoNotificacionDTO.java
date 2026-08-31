package ar.edu.utn.frc.tup.app.dtos.response.trabajo;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TrabajoCanceladoNotificacionDTO {
    private Integer idTrabajo;
    private String nombreProfesional;
    private String oficio;
    private Instant fechaCancelacion;
    private String motivoCancelacion;
    private String descripcionServicio;
}
