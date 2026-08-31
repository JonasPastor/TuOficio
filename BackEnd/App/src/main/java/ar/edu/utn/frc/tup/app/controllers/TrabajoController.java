package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.trabajo.FinalizarTrabajoRequest;
import ar.edu.utn.frc.tup.app.dtos.response.trabajo.TrabajoCanceladoNotificacionDTO;
import ar.edu.utn.frc.tup.app.dtos.response.trabajo.TrabajoClienteResponse;
import ar.edu.utn.frc.tup.app.dtos.response.trabajo.TrabajoFinalizadoNotificacionDTO;
import ar.edu.utn.frc.tup.app.dtos.response.trabajo.TrabajoResponse;
import ar.edu.utn.frc.tup.app.entities.Trabajo;
import ar.edu.utn.frc.tup.app.services.TrabajoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trabajos")
@RequiredArgsConstructor
@Slf4j
public class TrabajoController {

    private final TrabajoService trabajoService;

    @PostMapping("/crear/{idSolicitud}")
    public ResponseEntity<?> crearTrabajo(@PathVariable Integer idSolicitud) {
        try {
            Trabajo trabajo = trabajoService.crearTrabajo(idSolicitud);
            return ResponseEntity.status(HttpStatus.CREATED).body(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al crear trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/iniciar/{idTrabajo}")
    public ResponseEntity<?> iniciarTrabajo(@PathVariable Integer idTrabajo) {
        try {
            TrabajoResponse trabajo = trabajoService.iniciarTrabajo(idTrabajo);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al iniciar trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/pausar/{idTrabajo}")
    public ResponseEntity<?> pausarTrabajo(@PathVariable Integer idTrabajo) {
        try {
            TrabajoResponse trabajo = trabajoService.pausarTrabajo(idTrabajo);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al pausar trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/reanudar/{idTrabajo}")
    public ResponseEntity<?> reanudarTrabajo(@PathVariable Integer idTrabajo) {
        try {
            TrabajoResponse trabajo = trabajoService.reanudarTrabajo(idTrabajo);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al reanudar trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/finalizar/{idTrabajo}")
    public ResponseEntity<?> finalizarTrabajo(
            @PathVariable Integer idTrabajo,
            @RequestBody FinalizarTrabajoRequest request) {
        try {
            TrabajoResponse trabajo = trabajoService.finalizarTrabajo(idTrabajo, request);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al finalizar trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/cancelar/{idTrabajo}")
    public ResponseEntity<?> cancelarTrabajo(
            @PathVariable Integer idTrabajo,
            @RequestParam String motivo) {
        try {
            TrabajoResponse trabajo = trabajoService.cancelarTrabajo(idTrabajo, motivo);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al cancelar trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{idTrabajo}")
    public ResponseEntity<?> obtenerTrabajo(@PathVariable Integer idTrabajo) {
        try {
            TrabajoResponse trabajo = trabajoService.obtenerTrabajoPorId(idTrabajo);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajo", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<?> obtenerTrabajoPorSolicitud(@PathVariable Integer idSolicitud) {
        try {
            TrabajoResponse trabajo = trabajoService.obtenerTrabajoPorSolicitud(idSolicitud);
            return ResponseEntity.ok(trabajo);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajo por solicitud", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/profesional/{idProfesional}")
    public ResponseEntity<?> obtenerTrabajosPorProfesional(
            @PathVariable Integer idProfesional) {
        try {
            List<TrabajoResponse> trabajos = trabajoService
                    .obtenerTrabajosPorProfesional(idProfesional);

            if (trabajos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No se encontraron trabajos")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos del profesional", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/profesional/estado/{idProfesional}")
    public ResponseEntity<?> obtenerTrabajosPorProfesional(
            @PathVariable Integer idProfesional,
            @RequestParam String estado) {
        try {
            List<TrabajoResponse> trabajos = trabajoService
                    .obtenerTrabajosPorProfesionalyEstado(idProfesional, estado);

            if (trabajos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No se encontraron trabajos")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos del profesional", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerTrabajosPorUsuario(
            @PathVariable Integer idUsuario,
            @RequestParam(required = false) String estado) {
        try {
            List<TrabajoResponse> trabajos = trabajoService
                    .obtenerTrabajosPorUsuario(idUsuario, estado);

            if (trabajos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No se encontraron trabajos")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos del usuario", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/sin-factura")
    public ResponseEntity<?> obtenerTrabajosSinFactura() {
        try {
            List<TrabajoResponse> trabajos = trabajoService.obtenerTrabajosSinFactura();

            if (trabajos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No hay trabajos finalizados sin factura")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos sin factura", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/cliente/finalizados/{idUsuario}")
    public ResponseEntity<?> obtenerTrabajosFinalizadosPorCliente(
            @PathVariable Integer idUsuario) {
        try {
            List<TrabajoClienteResponse> trabajos =
                    trabajoService.obtenerTrabajosFinalizadosPorCliente(idUsuario);

            if (trabajos.isEmpty()) {
                ErrorApi error = ErrorApi.builder()
                        .timestamp(Instant.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .error("Not Found")
                        .message("No se encontraron trabajos finalizados para el cliente")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos finalizados del cliente", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/cliente/cancelados/{idUsuario}")
    public ResponseEntity<?> obtenerTrabajosCanceladosPorCliente(
            @PathVariable Integer idUsuario) {
        try {
            List<TrabajoCanceladoNotificacionDTO> trabajos =
                    trabajoService.obtenerTrabajosCanceladosPorCliente(idUsuario);

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos cancelados del cliente", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/cliente/finalizados/notificaciones/{idUsuario}")
    public ResponseEntity<?> obtenerTrabajosFinalizadosParaNotificar(
            @PathVariable Integer idUsuario) {
        try {
            List<TrabajoFinalizadoNotificacionDTO> trabajos =
                    trabajoService.obtenerTrabajosFinalizadosParaNotificar(idUsuario);

            return ResponseEntity.ok(trabajos);
        } catch (RuntimeException e) {
            log.error("Error al obtener trabajos finalizados para notificar", e);
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


