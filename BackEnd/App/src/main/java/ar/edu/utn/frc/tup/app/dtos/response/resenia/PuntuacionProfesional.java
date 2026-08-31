package ar.edu.utn.frc.tup.app.dtos.response.resenia;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PuntuacionProfesional {
    private String nombreProfesional;
    private Double puntuacion;
}
