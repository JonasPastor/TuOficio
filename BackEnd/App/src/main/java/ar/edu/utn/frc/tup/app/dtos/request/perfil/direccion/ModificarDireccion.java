package ar.edu.utn.frc.tup.app.dtos.request.perfil.direccion;

import ar.edu.utn.frc.tup.app.entities.Barrio;

public class ModificarDireccion {
    private Integer id;
    private Barrio barrio;
    private String calle;
    private String numero;
    private String piso;
    private String depto;
    private String observaciones;
}
