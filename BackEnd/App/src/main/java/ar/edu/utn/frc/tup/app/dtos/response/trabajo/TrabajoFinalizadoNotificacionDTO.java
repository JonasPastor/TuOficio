package ar.edu.utn.frc.tup.app.dtos.response.trabajo;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TrabajoFinalizadoNotificacionDTO {
    private Integer idTrabajo;
    private String nombreProfesional;
    private String oficio;
    private Instant fechaFinalizacion;
    private BigDecimal montoFinal;
    private String descripcionServicio;
    private boolean pagado;
}
