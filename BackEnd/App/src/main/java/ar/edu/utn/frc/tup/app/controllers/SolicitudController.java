package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.solicitud.ReprogramarRequest;
import ar.edu.utn.frc.tup.app.dtos.request.solicitud.SolicitudRequest;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.SolicitudDetalleResponse;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.SolicitudResponse;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.SolicitudUsuarioResponse;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.TurnoDisponibleDTO;
import ar.edu.utn.frc.tup.app.entities.Direccione;
import ar.edu.utn.frc.tup.app.entities.Solicitude;
import ar.edu.utn.frc.tup.app.services.SolicitudService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping("/enviar/")
    public ResponseEntity<?> enviarSolicitud(@RequestBody SolicitudRequest solicitud){
        try{
            return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.enviarSolicitud(solicitud));
        } catch (RuntimeException e){
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/responder/{idSolicitud}")
    public ResponseEntity<?> responderSolicitud(@PathVariable Integer idSolicitud, @RequestParam Boolean aceptada){
        try{
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(solicitudService.responderSolicitud(idSolicitud, aceptada));
        } catch (RuntimeException e){
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/solicitud/{idProfesional}/{estado}")
    public ResponseEntity<?> getSolicitud(@PathVariable Integer idProfesional, @PathVariable String estado) {
        List<SolicitudResponse> solicitudes = solicitudService.getSolicitudes(idProfesional, estado);
        if (solicitudes.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Solicitudes no encontradas")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> getSolicitudByIdUsuario(@PathVariable Integer idUsuario) {
        List<SolicitudUsuarioResponse> solicitudes = solicitudService.getSolicitudByIdUsuario(idUsuario);
        if (solicitudes.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Solicitudes no encontradas")
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/turnos/disponibles/semana/{idProfesional}")
    public ResponseEntity<?> getTurnosDisponiblesSemana(
            @PathVariable Integer idProfesional,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(defaultValue = "60") Integer duracion) {
        try {
            List<TurnoDisponibleDTO> turnos = solicitudService
                    .obtenerTurnosDisponiblesSemana(idProfesional, fechaInicio, duracion);

            if (turnos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(java.time.Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No hay turnos disponibles en la semana seleccionada")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(turnos);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/turnos/confirmar")
    public ResponseEntity<?> confirmarTurno(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idProfesional,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam String hora, // Cambiar a String
            @RequestParam(defaultValue = "60") Integer duracion,
            @RequestParam(required = false) String observacion) {
        try {
            LocalTime horaTime = LocalTime.parse(hora);

            SolicitudResponse response = solicitudService
                    .confirmarTurno(idUsuario, idProfesional, fecha, horaTime, duracion, observacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (java.time.format.DateTimeParseException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message("Formato de hora inválido. Use HH:mm:ss (ejemplo: 10:00:00)")
                    .build();
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/reprogramar/{idSolicitud}")
    public ResponseEntity<?> reprogramarSolicitud(
            @PathVariable Integer idSolicitud,
            @RequestBody ReprogramarRequest request) {
        try {
            String mensaje = solicitudService.reprogramarFecha(idSolicitud, request);

            Map<String, String> response = new HashMap<>();
            response.put("message", mensaje);
            response.put("timestamp", Instant.now().toString());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/verificar-disponibilidad/{idProfesional}")
    public ResponseEntity<?> verificarDisponibilidad(
            @PathVariable Integer idProfesional,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam String hora,
            @RequestParam(defaultValue = "60") Integer duracion) {
        try {
            LocalTime horaTime = LocalTime.parse(hora);

            List<TurnoDisponibleDTO> turnosDisponibles = solicitudService
                    .obtenerTurnosDisponiblesSemana(idProfesional, fecha, duracion);

            boolean disponible = turnosDisponibles.stream()
                    .anyMatch(t -> t.getFecha().equals(fecha) &&
                            t.getHoraInicio().equals(horaTime));

            Map<String, Object> response = new HashMap<>();
            response.put("disponible", disponible);
            response.put("fecha", fecha);
            response.put("hora", hora);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/verificar-pendiente")
    public ResponseEntity<?> verificarSolicitudPendiente(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idProfesional) {
        try {
            boolean tienePendiente = solicitudService.tieneSolicitudPendiente(idUsuario, idProfesional);
            Map<String, Object> response = new HashMap<>();
            response.put("tieneSolicitudPendiente", tienePendiente);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/profesional/{idProfesional}/con-ubicacion")
    public ResponseEntity<List<Map<String, Object>>> getSolicitudesByProfesionalConUbicacion(
            @PathVariable Integer idProfesional) {
        try {
            List<Map<String, Object>> solicitudes = solicitudService
                    .getSolicitudesByProfesionalConUbicacion(idProfesional);

            if (solicitudes.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/profesional/{idProfesional}/con-ubicacion/paginado")
    public ResponseEntity<?> getSolicitudesByProfesionalConUbicacionPaginado(
            @PathVariable Integer idProfesional,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "5") int tamanio) {
        try {
            Map<String, Object> resultado = solicitudService
                    .getSolicitudesByProfesionalConUbicacionPaginado(idProfesional, pagina, tamanio);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{idSolicitud}/ubicacion")
    public ResponseEntity<Map<String, Object>> getSolicitudConUbicacion(
            @PathVariable Integer idSolicitud) {
        try {
            Map<String, Object> resultado = solicitudService.getSolicitudConUbicacion(idSolicitud);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", error.getError(),
                    "message", error.getMessage()
            ));
        }
    }

    @GetMapping("/{idSolicitud}")
    public ResponseEntity<?> getSolicitudById(@PathVariable Integer idSolicitud) {
        try {
            Solicitude solicitud = solicitudService.getSolicitudById(idSolicitud);
            SolicitudDetalleResponse response = new SolicitudDetalleResponse(solicitud);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/profesionales/mas-solicitados")
    public ResponseEntity<?> getProfesionalesMasSolicitados() {
        try {
            List<PerfilProfesional> profesionales = solicitudService.getProfesionalesMasSolicitadosUltimoMes();

            if (profesionales.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No se encontraron profesionales solicitados en el último mes")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(profesionales);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/estadisticas/oficios-mas-solicitados")
    public ResponseEntity<?> getOficiosMasSolicitados(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<Map<String, Object>> oficios = solicitudService.getOficiosMasSolicitados(fechaInicio, fechaFin);

            if (oficios == null || oficios.isEmpty()) {
                return ResponseEntity.ok(null);
            }

            return ResponseEntity.ok(oficios);
        } catch (Exception e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }


}

