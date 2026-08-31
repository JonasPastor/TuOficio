package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.request.factura.FacturaRequest;
import ar.edu.utn.frc.tup.app.dtos.response.PagoFactura;
import ar.edu.utn.frc.tup.app.dtos.response.PreferenceResponse;
import ar.edu.utn.frc.tup.app.dtos.response.factura.FacturaPDFDto;
import ar.edu.utn.frc.tup.app.entities.Factura;
import ar.edu.utn.frc.tup.app.entities.Mediosdepago;
import ar.edu.utn.frc.tup.app.entities.Solicitude;
import ar.edu.utn.frc.tup.app.entities.Trabajo;
import ar.edu.utn.frc.tup.app.repositories.FacturaRepository;
import ar.edu.utn.frc.tup.app.repositories.MediosdepagoRepository;
import ar.edu.utn.frc.tup.app.repositories.SolicitudeRepository;
import ar.edu.utn.frc.tup.app.repositories.TrabajoRepository;
import ar.edu.utn.frc.tup.app.services.FacturaService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacturaServiceImpl implements FacturaService {

    private final FacturaRepository facturaRepository;
    private final MediosdepagoRepository mediosdepagoRepository;
    private final SolicitudeRepository solicitudeRepository;
    private final TrabajoRepository trabajoRepository; // ⭐ NUEVO

    @Value("${mercadopago.webhook.url}")
    private String webhookUrl;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @Value("${mercadopago.frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public PreferenceResponse crearPreferenciaPago(FacturaRequest request) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            log.info("========== CREAR PREFERENCIA ==========");
            log.info("Access Token configurado: {}...", accessToken.substring(0, 20));
            log.info("Frontend URL base: {}", frontendUrl);

            if (request.getIdTrabajo() == null) {
                throw new RuntimeException("Debe proporcionar el ID del trabajo");
            }

            Trabajo trabajo = trabajoRepository.findById(request.getIdTrabajo())
                    .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

            if (!"FINALIZADO".equals(trabajo.getEstado())) {
                throw new RuntimeException("Solo se pueden facturar trabajos finalizados");
            }

            if (trabajo.getFactura() != null) {
                log.info("El trabajo {} ya tiene una factura asociada (ID: {}). Retornando factura existente.",
                    trabajo.getId(), trabajo.getFactura().getId());

                // En lugar de lanzar error, retornar la preferencia existente si hay idpago
                if (trabajo.getIdpago() != null && !trabajo.getIdpago().isEmpty()) {
                    return PreferenceResponse.builder()
                            .initPoint(trabajo.getIdpago())
                            .sandboxInitPoint(trabajo.getIdpago())
                            .build();
                } else {
                    throw new RuntimeException("Este trabajo ya fue facturado y no tiene pago pendiente");
                }
            }

            Solicitude solicitud = trabajo.getSolicitud();
            log.info("ID Trabajo: {}", trabajo.getId());
            log.info("ID Solicitud: {}", solicitud.getId());

            Factura factura = crearFacturaPendiente(trabajo, request.getMonto());

            log.info("Factura creada con ID: {}", factura.getId());
            log.info("Título: {}", request.getTitulo());
            log.info("Monto: {}", request.getMonto());

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(String.valueOf(factura.getId()))
                    .title(request.getTitulo())
                    .description(request.getDescripcion())
                    .quantity(request.getCantidad() != null ? request.getCantidad() : 1)
                    .currencyId("ARS")
                    .unitPrice(request.getMonto())
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(item);

            String baseUrl = frontendUrl.endsWith("/") ?
                    frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(baseUrl + "/pago-exitoso")
                    .failure(baseUrl + "/pago-fallido")
                    .pending(baseUrl + "/pago-pendiente")
                    .build();

            log.info("URLs de retorno configuradas:");
            log.info("Success: {}", backUrls.getSuccess());
            log.info("Failure: {}", backUrls.getFailure());
            log.info("Pending: {}", backUrls.getPending());

            PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                    .installments(12)
                    .defaultInstallments(1)
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .paymentMethods(paymentMethods)
                    .notificationUrl(webhookUrl)
                    .externalReference(String.valueOf(factura.getId()))
                    .statementDescriptor("Tu Oficio")
                    .build();

            log.info("PreferenceRequest configurado:");
            log.info("Items: {}", items.size());
            log.info("Notification URL: {}", webhookUrl);
            log.info("External Reference: {}", factura.getId());

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            log.info("Preferencia creada exitosamente");
            log.info("Preference ID: {}", preference.getId());

            boolean isSandbox = accessToken != null && accessToken.startsWith("TEST-");
            String initUrl = isSandbox ? preference.getSandboxInitPoint() : preference.getInitPoint();

            log.info("Modo sandbox: {}", isSandbox);
            log.info("Init URL: {}", initUrl);

            trabajo.setIdpago(initUrl);
            trabajoRepository.save(trabajo);
            log.info("Campo idpago actualizado en el trabajo {} con initPoint: {}", trabajo.getId(), initUrl);

            return PreferenceResponse.builder()
                    .preferenceId(preference.getId())
                    .initPoint(initUrl)
                    .sandboxInitPoint(preference.getSandboxInitPoint())
                    .build();

        } catch (MPApiException e) {
            log.error("========== ERROR MERCADOPAGO API ==========");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Message: {}", e.getMessage());

            if (e.getApiResponse() != null) {
                log.error("API Response Status: {}", e.getApiResponse().getStatusCode());
                log.error("API Response Content: {}", e.getApiResponse().getContent());
                log.error("API Response Headers: {}", e.getApiResponse().getHeaders());
            }

            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }

            String errorDetail = e.getApiResponse() != null ?
                    e.getApiResponse().getContent() : e.getMessage();
            throw new RuntimeException("Error MercadoPago API: " + errorDetail, e);

        } catch (MPException e) {
            log.error("========== ERROR MERCADOPAGO ==========");
            log.error("Error MPException: {}", e.getMessage(), e);
            throw new RuntimeException("Error MercadoPago: " + e.getMessage(), e);

        } catch (Exception e) {
            log.error("========== ERROR INESPERADO ==========");
            log.error("Error inesperado al crear preferencia", e);
            log.error("Tipo de error: {}", e.getClass().getName());
            log.error("Stack trace completo:", e);
            throw new RuntimeException("Error interno: " + e.getMessage(), e);
        }
    }

    @Transactional
    protected Factura crearFacturaPendiente(Trabajo trabajo, BigDecimal monto) {
        try {
            log.info("Creando factura pendiente para trabajo: {}", trabajo.getId());

            Solicitude solicitud = trabajo.getSolicitud();

            // Obtener medio de pago de MercadoPago
            Mediosdepago medioPago = mediosdepagoRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Medio de pago no encontrado"));

            Factura factura = new Factura();
            factura.setIdusuario(solicitud.getIdusuario());
            factura.setIdprofesional(solicitud.getIdprofesional());
            factura.setIdmediopago(medioPago);
            factura.setImporte(monto);
            factura.setEstadopago("PENDIENTE");
            factura.setFecha(Instant.now());
            factura.setTrabajo(trabajo);

            Factura facturaSaved = facturaRepository.save(factura);
            log.info("Factura pendiente creada con ID: {}", facturaSaved.getId());

            trabajo.setFactura(facturaSaved);
            trabajoRepository.save(trabajo);
            log.info("Trabajo actualizado con factura ID: {}", facturaSaved.getId());

            return facturaSaved;

        } catch (Exception e) {
            log.error("Error al crear factura pendiente", e);
            throw new RuntimeException("Error al crear factura: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Factura procesarPagoAprobado(Map<String, Object> paymentData) {
        try {
            log.info("========== PROCESAR PAGO APROBADO ==========");
            log.info("Payment Data: {}", paymentData);

            String externalReference = null;

            if (paymentData.get("external_reference") != null) {
                externalReference = paymentData.get("external_reference").toString();
            }

            if (externalReference != null) {
                Integer facturaId = Integer.valueOf(externalReference);
                Factura factura = facturaRepository.findById(facturaId)
                        .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + facturaId));

                factura.setEstadopago("APROBADO");
                Factura facturaSaved = facturaRepository.save(factura);
                log.info("Factura actualizada a APROBADO con ID: {}", facturaSaved.getId());

                log.info("Trabajo asociado ID: {}", facturaSaved.getTrabajo().getId());

                return facturaSaved;
            } else {
                List<Factura> facturasPendientes = facturaRepository.findByEstadopagoOrderByFechaDesc("PENDIENTE");
                if (!facturasPendientes.isEmpty()) {
                    Factura factura = facturasPendientes.get(0);
                    factura.setEstadopago("APROBADO");
                    Factura facturaSaved = facturaRepository.save(factura);
                    log.info("Factura actualizada a APROBADO (por fecha) con ID: {}", facturaSaved.getId());
                    return facturaSaved;
                }
            }

            throw new RuntimeException("No se pudo procesar el pago - no hay facturas pendientes");

        } catch (Exception e) {
            log.error("Error al procesar pago aprobado", e);
            throw new RuntimeException("Error al actualizar factura: " + e.getMessage(), e);
        }
    }

    @Override
    public Factura obtenerFacturaPorId(Integer nroFactura) {
        log.info("Buscando factura con ID: {}", nroFactura);
        return facturaRepository.findById(nroFactura)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + nroFactura));
    }

    @Override
    @Transactional
    public void actualizarEstadoPago(Integer nroFactura, String estado) {
        try {
            log.info("Actualizando estado de factura {} a {}", nroFactura, estado);
            Factura factura = obtenerFacturaPorId(nroFactura);
            factura.setEstadopago(estado);
            facturaRepository.save(factura);
            log.info("Estado actualizado correctamente");
        } catch (Exception e) {
            log.error("Error al actualizar estado de factura", e);
            throw new RuntimeException("Error al actualizar estado: " + e.getMessage(), e);
        }
    }

    @Override
    public List<PagoFactura> historialDeIngresos(Instant desde, Instant hasta, Integer idProfesional) {
        List<Factura> facturas;

        if (idProfesional != null) {
            facturas = facturaRepository.findByFechaBetweenAndEstadopagoAndIdprofesionalId(desde, hasta, "APROBADO", idProfesional);
            log.info("Buscando ingresos para profesional ID: {}", idProfesional);
        } else {
            facturas = facturaRepository.findByFechaBetweenAndEstadopago(desde, hasta, "APROBADO");
            log.info("Buscando todos los ingresos sin filtro de profesional");
        }

        if (facturas.isEmpty()) {
            log.info("No se encontraron pagos en el rango de fechas especificado");
            return new ArrayList<>();
        }

        List<PagoFactura> pagos = new ArrayList<>();
        for (Factura factura : facturas) {
            PagoFactura pago = PagoFactura.builder()
                    .nroFactura(factura.getId())
                    .fecha(factura.getFecha())
                    .monto(factura.getImporte())
                    .cliente(factura.getIdusuario().getIdauth().getName() + " "
                            + factura.getIdusuario().getIdauth().getLastname())
                    .build();
            pagos.add(pago);
        }
        return pagos;
    }

    @Override
    public FacturaPDFDto obtenerDatosFacturaPDF(Integer nroFactura) {
        Factura factura = facturaRepository.findById(nroFactura)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        Trabajo trabajo = factura.getTrabajo();
        if (trabajo == null) {
            throw new RuntimeException("No se encontró el trabajo asociado a la factura");
        }

        String nombreCliente = factura.getIdusuario().getIdauth().getName() + " " +
                              factura.getIdusuario().getIdauth().getLastname();

        String nombreProfesional = factura.getIdprofesional().getIdusuario().getIdauth().getName() + " " +
                                   factura.getIdprofesional().getIdusuario().getIdauth().getLastname();

//        String descripcionServicio = trabajo.getSolicitud().getOficio().getNombre();
        String descripcionServicio = trabajo.getSolicitud().getIdoficio().getOficio();

        return FacturaPDFDto.builder()
                .nroFactura(factura.getId())
                .nombreCliente(nombreCliente)
                .nombreProfesional(nombreProfesional)
                .descripcionServicio(descripcionServicio)
                .importe(factura.getImporte())
                .fecha(factura.getFecha())
                .estadoPago(factura.getEstadopago())
                .medioPago("Mercado Pago")
                .build();
    }
}




