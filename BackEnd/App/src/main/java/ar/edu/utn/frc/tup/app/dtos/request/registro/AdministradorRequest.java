package ar.edu.utn.frc.tup.app.dtos.request.registro;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdministradorRequest {
    private String password;
    private String name;
    private String lastName;
    private String mail;
}
