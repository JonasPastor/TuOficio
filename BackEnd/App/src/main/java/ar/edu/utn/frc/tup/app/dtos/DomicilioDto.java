package ar.edu.utn.frc.tup.app.dtos;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DomicilioDto {
    private Integer id; // ID de la direcci\u00f3n
    private String calle;
    private String numero;
    private String piso;
    private String depto;
    private String barrio;
    private String ciudad;
    private String departamento;
}
