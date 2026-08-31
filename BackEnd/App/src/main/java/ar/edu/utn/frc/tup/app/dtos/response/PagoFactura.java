package ar.edu.utn.frc.tup.app.dtos.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
public class PagoFactura {
    private Integer nroFactura;
    private Instant fecha;
    private BigDecimal monto;
    private String cliente;
}
