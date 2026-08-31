package ar.edu.utn.frc.tup.app.dtos.response.solicitud;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class SolicitudResponse {
    private Integer idSolicitud;
    private String nombreUsuario;
    private String nombreProfesional;
    private Instant fechasolicitud;
    private Instant fechaservicio;
    private String direccion;
    private String observacion;
    private String horaReserva;
}
