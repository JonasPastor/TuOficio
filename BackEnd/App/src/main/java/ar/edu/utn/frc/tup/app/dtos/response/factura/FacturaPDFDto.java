package ar.edu.utn.frc.tup.app.dtos.response.factura;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class FacturaPDFDto {
    private Integer nroFactura;
    private String nombreCliente;
    private String nombreProfesional;
    private String descripcionServicio;
    private BigDecimal importe;
    private Instant fecha;
    private String estadoPago;
    private String medioPago;
}
