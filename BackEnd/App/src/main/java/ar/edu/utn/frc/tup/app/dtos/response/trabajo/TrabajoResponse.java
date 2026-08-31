package ar.edu.utn.frc.tup.app.dtos.response.trabajo;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TrabajoResponse {
    private Integer idTrabajo;
    private Integer idSolicitud;
    private String estado;
    private String nombreCliente;
    private String nombreProfesional;
    private String oficio;
    private Instant fechaInicio;
    private Instant fechaFinalizacion;
    private Integer duracionReal;
    private BigDecimal montoFinal;
    private BigDecimal montoAdicional;
    private String descripcionAdicional;
    private String fotoTrabajo;
    private String observacionesTrabajo;
    private Integer idFactura;
    private String estadoPago;
}
