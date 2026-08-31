package ar.edu.utn.frc.tup.app.dtos.response.resenia;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopProfesionales {
    private String nombreProfesional;
    private String profesion;
    private Double puntuacion;
}
