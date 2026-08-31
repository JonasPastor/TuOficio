package ar.edu.utn.frc.tup.app.dtos.response.solicitud;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SolicitudUsuarioResponse {
    private Integer idSolicitud;
    private Integer idProfesional;
    private String nombreProfesional;
    private String apellidoProfesional;
    private Instant fechaSolicitud;
    private String estado;
    private String imagenUrl;
}
