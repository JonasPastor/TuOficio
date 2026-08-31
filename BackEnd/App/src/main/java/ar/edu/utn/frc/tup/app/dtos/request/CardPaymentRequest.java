package ar.edu.utn.frc.tup.app.dtos.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CardPaymentRequest {
    private BigDecimal importe;
    private Integer profesionalId;
    private Integer clienteId;

    private String token;
    private Integer installments;
    private String paymentMethodId;
    private String email;
    private String docType;
    private String docNumber;
}
