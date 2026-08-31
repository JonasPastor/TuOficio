package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.request.reporte.ReporteRequest;
import ar.edu.utn.frc.tup.app.dtos.response.reporte.ReporteResponse;
import ar.edu.utn.frc.tup.app.services.ReporteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"})
public class ReporteController {
    
    private final ReporteService reporteService;

    @PostMapping
    public ResponseEntity<ReporteResponse> crearReporte(@Valid @RequestBody ReporteRequest request) {
        try {
            ReporteResponse response = reporteService.crearReporte(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ReporteResponse>> obtenerTodosLosReportes() {
        List<ReporteResponse> reportes = reporteService.obtenerTodosLosReportes();
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<ReporteResponse>> obtenerReportesPendientes() {
        List<ReporteResponse> reportes = reporteService.obtenerReportesPendientes();
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/profesional/{idProfesional}")
    public ResponseEntity<List<ReporteResponse>> obtenerReportesPorProfesional(
            @PathVariable Integer idProfesional) {
        List<ReporteResponse> reportes = reporteService.obtenerReportesPorProfesional(idProfesional);
        return ResponseEntity.ok(reportes);
    }

    @PutMapping("/{idReporte}/atender")
    public ResponseEntity<ReporteResponse> marcarComoAtendido(
            @PathVariable Integer idReporte,
            @RequestBody(required = false) String resolucion) {
        try {
            ReporteResponse response = reporteService.marcarComoAtendido(idReporte, resolucion);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{idReporte}")
    public ResponseEntity<Void> eliminarReporte(@PathVariable Integer idReporte) {
        try {
            reporteService.eliminarReporte(idReporte);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
