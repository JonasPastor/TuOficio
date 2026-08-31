package ar.edu.utn.frc.tup.app.dtos.request.registro;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProfesionalRequest {
    private Integer idUsuario;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private Integer idOficio;
    private Integer precioMin;
    private Integer precioMax;
    private List<String> especialidades;

}
