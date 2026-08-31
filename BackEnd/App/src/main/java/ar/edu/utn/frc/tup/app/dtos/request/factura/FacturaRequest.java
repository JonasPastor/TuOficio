package ar.edu.utn.frc.tup.app.dtos.request.factura;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaRequest {
    private Integer idSolicitud;
    private Integer idTrabajo;
    private String titulo;
    private String descripcion;
    private Integer cantidad;
    private BigDecimal monto;
}