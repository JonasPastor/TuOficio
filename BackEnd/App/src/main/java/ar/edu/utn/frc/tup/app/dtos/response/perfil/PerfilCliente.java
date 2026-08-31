package ar.edu.utn.frc.tup.app.dtos.response.perfil;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class PerfilCliente {
    private String avatar;
    private String name;
    private String lastName;
    private String email;
    private String telefono;
    private String documento;
    private String tipoDocumento;
    private LocalDate nacimiento;
    private DomicilioDto domicilio;
    private Integer strikes;
    private Boolean estado;
}
