package ar.edu.utn.frc.tup.app.dtos.response.solicitud;

import ar.edu.utn.frc.tup.app.entities.Solicitude;
import lombok.Data;

@Data
public class SolicitudDetalleResponse {
    private Integer id;
    private Integer idProfesional;

    public SolicitudDetalleResponse(Solicitude solicitud) {
        this.id = solicitud.getId();
        this.idProfesional = solicitud.getIdprofesional().getId();
    }
}
