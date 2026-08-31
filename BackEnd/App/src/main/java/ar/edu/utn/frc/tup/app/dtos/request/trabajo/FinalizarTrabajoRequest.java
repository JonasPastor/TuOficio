package ar.edu.utn.frc.tup.app.dtos.request.trabajo;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FinalizarTrabajoRequest {
    private Integer duracionReal;
    private BigDecimal montoFinal;
    private BigDecimal montoAdicional;
    private String descripcionAdicional;
    private String fotoTrabajo;
    private String observaciones;
}
