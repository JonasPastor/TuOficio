package ar.edu.utn.frc.tup.app.dtos.request.solicitud;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ReprogramarRequest {
    private LocalDate nuevaFecha;
    private LocalTime nuevaHora;
    private Integer duracion;
}