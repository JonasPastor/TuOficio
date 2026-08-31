package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.request.reporte.ReporteRequest;
import ar.edu.utn.frc.tup.app.dtos.response.reporte.ReporteResponse;
import ar.edu.utn.frc.tup.app.entities.Profesionale;
import ar.edu.utn.frc.tup.app.entities.Reporte;
import ar.edu.utn.frc.tup.app.entities.Usuario;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.repositories.ReporteRepository;
import ar.edu.utn.frc.tup.app.repositories.UsuarioRepository;
import ar.edu.utn.frc.tup.app.services.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements ReporteService {
    
    private final ReporteRepository reporteRepository;
    private final ProfesionalRepository profesionalRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public ReporteResponse crearReporte(ReporteRequest request) {
        Profesionale profesional = profesionalRepository.findById(request.getIdProfesional())
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        Usuario reportante = null;
        if (request.getReportadoPor() != null) {
            reportante = usuarioRepository.findById(request.getReportadoPor())
                    .orElse(null);
        }

        Reporte reporte = Reporte.builder()
                .idprofesional(profesional)
                .reportadoPor(reportante)
                .razon(request.getRazon())
                .atendido(false)
                .build();

        Reporte savedReporte = reporteRepository.save(reporte);
        return mapToResponse(savedReporte);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteResponse> obtenerTodosLosReportes() {
        return reporteRepository.findAllWithDetails().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteResponse> obtenerReportesPendientes() {
        return reporteRepository.findAllPendientes().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteResponse> obtenerReportesPorProfesional(Integer idProfesional) {
        return reporteRepository.findByProfesionalId(idProfesional).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReporteResponse marcarComoAtendido(Integer idReporte, String resolucion) {
        Reporte reporte = reporteRepository.findById(idReporte)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        reporte.setAtendido(true);
        reporte.setFechaAtencion(LocalDateTime.now());
        reporte.setResolucion(resolucion);

        Reporte updatedReporte = reporteRepository.save(reporte);
        return mapToResponse(updatedReporte);
    }

    @Override
    @Transactional
    public void eliminarReporte(Integer idReporte) {
        if (!reporteRepository.existsById(idReporte)) {
            throw new RuntimeException("Reporte no encontrado");
        }
        reporteRepository.deleteById(idReporte);
    }

    private ReporteResponse mapToResponse(Reporte reporte) {
        String nombreProfesional = "";
        if (reporte.getIdprofesional() != null && reporte.getIdprofesional().getIdusuario() != null) {
            Usuario usuario = reporte.getIdprofesional().getIdusuario();
            nombreProfesional = (usuario.getIdauth() != null)
                ? usuario.getIdauth().getName() + " " + usuario.getIdauth().getLastname()
                : "Desconocido";
        }

        String nombreReportante = null;
        if (reporte.getReportadoPor() != null && reporte.getReportadoPor().getIdauth() != null) {
            nombreReportante = reporte.getReportadoPor().getIdauth().getName() +
                             " " + reporte.getReportadoPor().getIdauth().getLastname();
        }

        return ReporteResponse.builder()
                .id(reporte.getId())
                .idProfesional(reporte.getIdprofesional() != null ? reporte.getIdprofesional().getId() : null)
                .nombreProfesional(nombreProfesional)
                .reportadoPor(reporte.getReportadoPor() != null ? reporte.getReportadoPor().getId() : null)
                .nombreReportante(nombreReportante)
                .razon(reporte.getRazon())
                .fechaReporte(reporte.getFechaReporte())
                .atendido(reporte.getAtendido())
                .fechaAtencion(reporte.getFechaAtencion())
                .resolucion(reporte.getResolucion())
                .build();
    }
}
