package ar.edu.utn.frc.tup.app.dtos.request.perfil;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
public class ModificarProfesional {
    private Integer idProfesional;
    private Integer idOficio;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private Integer precioMin;
    private Integer precioMax;
    private List<String> especialidades;
}
