package ar.edu.utn.frc.tup.app.dtos.request.resenia;

import lombok.Data;

@Data
public class ReseniaRequest {
    private Integer idUsuario;
    private Integer idProfesional;
    private Integer idTrabajo;
    private Integer puntuacion;
    private String comentario;
}
