package ar.edu.utn.frc.tup.app.dtos.request.solicitud;

import lombok.Data;

import java.time.Instant;

@Data
public class SolicitudRequest {
    private Integer idUsuario;
    private Integer idProfesional;
    private Instant fechasolicitud;
    private Instant fechaservicio;
    private String observacion;
    private String horaReserva;
}
