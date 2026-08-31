package ar.edu.utn.frc.tup.app.dtos.response.trabajo;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TrabajoClienteResponse {
    private Integer idTrabajo;
    private Integer idSolicitud;
    private String profesional;
    private String descripcion;
    private String idpago;
    private String estado;
    private String montoFinal;
    private Instant fechaFinalizacion;
    private String estadoPago;
    private Integer nroFactura;
    private Boolean tieneResenia;
}
