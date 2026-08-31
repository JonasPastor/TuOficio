package ar.edu.utn.frc.tup.app.dtos.response.oficio;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OficioXSolicitud {
    private String oficio;
    private Long cantidadDeSolicitudes;

    public OficioXSolicitud(String oficio, Long cantidadDeSolicitudes) {
        this.oficio = oficio;
        this.cantidadDeSolicitudes = cantidadDeSolicitudes;
    }
}
