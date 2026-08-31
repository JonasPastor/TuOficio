package ar.edu.utn.frc.tup.app.dtos;

import lombok.Data;

@Data
public class UsuarioDto {
    private Integer id;
    private String username;
    private String mail;
    private String roleDescripcion;
}
