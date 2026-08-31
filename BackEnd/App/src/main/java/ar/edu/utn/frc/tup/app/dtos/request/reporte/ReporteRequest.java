package ar.edu.utn.frc.tup.app.dtos.request.reporte;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteRequest {
    
    @NotNull(message = "El ID del profesional es requerido")
    private Integer idProfesional;

    @NotNull(message = "La razón del reporte es requerida")
    @Size(min = 10, max = 500, message = "La razón debe tener entre 10 y 500 caracteres")
    private String razon;

    private Integer reportadoPor;
}
