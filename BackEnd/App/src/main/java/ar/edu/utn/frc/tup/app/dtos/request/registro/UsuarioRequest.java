package ar.edu.utn.frc.tup.app.dtos.request.registro;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Optional;

@Getter
@Setter
public class UsuarioRequest {
    private String password;
    private String name;
    private String lastName;
    private String mail;
    private String documento;
    private String telefono;
    private LocalDate nacimiento;
    private Integer idBarrio;
    private Integer idTipoDoc;
    private String calle;
    private String numero;
    private Optional<String>  depto;
    private Optional<String>  piso;
    private Optional<String> observaciones;
}
