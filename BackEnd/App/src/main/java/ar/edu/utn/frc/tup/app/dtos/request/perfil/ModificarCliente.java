package ar.edu.utn.frc.tup.app.dtos.request.perfil;

import ar.edu.utn.frc.tup.app.entities.Direccione;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ModificarCliente {
    private String mail;
    private String name;
    private String lastName;
    private String phone;
    private Direccione adress;
}
