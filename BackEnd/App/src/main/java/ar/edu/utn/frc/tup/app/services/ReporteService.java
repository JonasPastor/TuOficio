package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.request.reporte.ReporteRequest;
import ar.edu.utn.frc.tup.app.dtos.response.reporte.ReporteResponse;

import java.util.List;

public interface ReporteService {
    
    ReporteResponse crearReporte(ReporteRequest request);
    
    List<ReporteResponse> obtenerTodosLosReportes();
    
    List<ReporteResponse> obtenerReportesPendientes();
    
    List<ReporteResponse> obtenerReportesPorProfesional(Integer idProfesional);
    
    ReporteResponse marcarComoAtendido(Integer idReporte, String resolucion);
    
    void eliminarReporte(Integer idReporte);
}
