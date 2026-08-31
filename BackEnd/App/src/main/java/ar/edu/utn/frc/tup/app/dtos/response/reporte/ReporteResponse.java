package ar.edu.utn.frc.tup.app.dtos.response.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponse {
    
    private Integer id;
    private Integer idProfesional;
    private String nombreProfesional;
    private Integer reportadoPor;
    private String nombreReportante;
    private String razon;
    private LocalDateTime fechaReporte;
    private Boolean atendido;
    private LocalDateTime fechaAtencion;
    private String resolucion;
}
