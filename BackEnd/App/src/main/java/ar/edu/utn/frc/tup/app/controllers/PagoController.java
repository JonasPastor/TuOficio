package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.factura.FacturaRequest;
import ar.edu.utn.frc.tup.app.dtos.response.PagoFactura;
import ar.edu.utn.frc.tup.app.dtos.response.PreferenceResponse;
import ar.edu.utn.frc.tup.app.dtos.response.factura.FacturaPDFDto;
import ar.edu.utn.frc.tup.app.entities.Departamento;
import ar.edu.utn.frc.tup.app.entities.Factura;
import ar.edu.utn.frc.tup.app.entities.Trabajo;
import ar.edu.utn.frc.tup.app.repositories.TrabajoRepository;
import ar.edu.utn.frc.tup.app.services.FacturaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pagos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PagoController {

    private final FacturaService facturaService;
    private final TrabajoRepository trabajoRepository;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @Value("${mercadopago.public.key}")
    private String publicKey;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<?> crearPreferencia(@RequestBody FacturaRequest request) {
        try {
            log.info("📝 Solicitud de creación de preferencia recibida");
            log.info("ID Trabajo: {}", request.getIdTrabajo());

            if (request.getIdTrabajo() == null) {
                throw new RuntimeException("Debe proporcionar el ID del trabajo");
            }

            Trabajo trabajo = trabajoRepository.findById(request.getIdTrabajo())
                    .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

            if (trabajo.getFactura() != null) {
                Factura facturaExistente = trabajo.getFactura();

                if ("APROBADO".equals(facturaExistente.getEstadopago())) {
                    log.warn("Intento de crear preferencia para trabajo ya pagado: {}", trabajo.getId());
                    throw new RuntimeException("Este trabajo ya ha sido pagado");
                }

                if (trabajo.getIdpago() != null && !trabajo.getIdpago().isEmpty()) {
                    log.info("Retornando preferencia existente para trabajo {}", trabajo.getId());
                    return ResponseEntity.ok(PreferenceResponse.builder()
                            .initPoint(trabajo.getIdpago())
                            .sandboxInitPoint(trabajo.getIdpago())
                            .build());
                }
            }

            PreferenceResponse response = facturaService.crearPreferenciaPago(request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al crear preferencia: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al crear preferencia", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        try {
            Map<String, Object> config = new HashMap<>();
            boolean isSandbox = accessToken != null && accessToken.startsWith("TEST-");

            config.put("publicKey", publicKey);
            config.put("sandbox", isSandbox);

            log.info("📤 Configuración MercadoPago enviada - Sandbox: {}", isSandbox);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("Error obteniendo configuración MercadoPago", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhookMercadoPago(
            @RequestBody Map<String, Object> payload,
            @RequestHeader Map<String, String> headers) {
        try {
            log.info("========== WEBHOOK RECIBIDO ==========");
            log.info("Payload: {}", payload);
            log.info("Headers: {}", headers);

            String type = (String) payload.get("type");
            String action = (String) payload.get("action");

            log.info("Type: {}, Action: {}", type, action);

            if ("payment".equals(type)) {
                Object dataObj = payload.get("data");
                if (dataObj instanceof Map) {
                    Map<String, Object> data = (Map<String, Object>) dataObj;
                    String paymentId = (String) data.get("id");
                    log.info("Payment ID recibido: {}", paymentId);

                    if (action != null && action.startsWith("payment")) {
                        facturaService.procesarPagoAprobado(data);
                        log.info("Procesando acción: {}", action);
                    }
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error procesando webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/historial-ingresos")
    public ResponseEntity<?> historialDeIngresos(
            @RequestParam String desde,
            @RequestParam String hasta,
            @RequestParam(required = false) Integer idProfesional) {
        try {
            log.info("Consultando historial de ingresos desde {} hasta {}, profesional: {}",
                    desde, hasta, idProfesional != null ? idProfesional : "todos");

            Instant desdeInstant = parseToInstant(desde, true);
            Instant hastaInstant = parseToInstant(hasta, false);

            log.info("Rango de tiempo: {} a {}", desdeInstant, hastaInstant);

            List<PagoFactura> pagos = facturaService.historialDeIngresos(desdeInstant, hastaInstant, idProfesional);
            log.info("Encontrados {} pagos", pagos.size());
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            log.error("Error inesperado al consultar historial", e);
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error("Internal Server Error")
                    .message("Error al procesar la solicitud: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private Instant parseToInstant(String fecha, boolean inicioDelDia) {
        try {
            return Instant.parse(fecha);
        } catch (Exception e1) {
            try {
                LocalDate localDate = LocalDate.parse(fecha);
                if (inicioDelDia) {
                    return localDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
                } else {
                    return localDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
                }
            } catch (Exception e2) {
                throw new RuntimeException("Formato de fecha inválido: " + fecha + ". Use formato ISO (2025-11-06T00:00:00Z) o LocalDate (2025-11-06)");
            }
        }
    }

    @GetMapping("/factura/{nroFactura}/pdf")
    public ResponseEntity<?> obtenerDatosFacturaPDF(@PathVariable Integer nroFactura) {
        try {
            FacturaPDFDto facturaPDF = facturaService.obtenerDatosFacturaPDF(nroFactura);
            return ResponseEntity.ok(facturaPDF);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

