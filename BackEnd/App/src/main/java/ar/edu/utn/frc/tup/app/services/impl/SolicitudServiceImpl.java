package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.request.solicitud.ReprogramarRequest;
import ar.edu.utn.frc.tup.app.dtos.request.solicitud.SolicitudRequest;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.SolicitudResponse;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.SolicitudUsuarioResponse;
import ar.edu.utn.frc.tup.app.dtos.response.solicitud.TurnoDisponibleDTO;
import ar.edu.utn.frc.tup.app.entities.Disponibilidad;
import ar.edu.utn.frc.tup.app.entities.Profesionale;
import ar.edu.utn.frc.tup.app.entities.Solicitude;
import ar.edu.utn.frc.tup.app.entities.Usuario;
import ar.edu.utn.frc.tup.app.repositories.DisponibilidadRepository;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.repositories.SolicitudeRepository;
import ar.edu.utn.frc.tup.app.repositories.UsuarioRepository;
import ar.edu.utn.frc.tup.app.services.OpenStreetMapService;
import ar.edu.utn.frc.tup.app.services.PerfilService;
import ar.edu.utn.frc.tup.app.services.SolicitudService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudeRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfesionalRepository profesionalRepository;
    private final OpenStreetMapService openStreetMapService;
    private final PerfilService perfilService;
    private final ar.edu.utn.frc.tup.app.repositories.OficioRepository oficioRepository;

    @Override
    public SolicitudResponse enviarSolicitud(SolicitudRequest solicitud) {
        Usuario usuario = usuarioRepository.findById(solicitud.getIdUsuario()).orElse(null);
        Profesionale profesional = profesionalRepository.findById(solicitud.getIdProfesional()).orElse(null);

        Solicitude nueva = Solicitude.builder()
                .idusuario(usuario)
                .idprofesional(profesional)
                .idoficio(profesional.getIdoficio())
                .fechasolicitud(solicitud.getFechasolicitud())
                .fechaservicio(solicitud.getFechaservicio())
                .estado("PENDIENTE")
                .iddireccion(usuario.getIddireccion())
                .observacion(solicitud.getObservacion())
                .horaReserva(solicitud.getHoraReserva())
                .build();

        solicitudRepository.save(nueva);

        SolicitudResponse response = SolicitudResponse.builder()
                .idSolicitud(nueva.getId())
                .nombreUsuario(usuario.getIdauth().getName() + " "
                        + usuario.getIdauth().getLastname())
                .nombreProfesional(profesional.getIdusuario().getIdauth().getName()
                        + " " + profesional.getIdusuario().getIdauth().getLastname())
                .fechasolicitud(nueva.getFechasolicitud())
                .fechaservicio(nueva.getFechaservicio())
                .direccion(usuario.getIddireccion().getCalle() + " " + usuario.getIddireccion().getNumero())
                .observacion(nueva.getObservacion())
                .horaReserva(nueva.getHoraReserva())
                .build();

        return response;
    }

    @Override
    public String responderSolicitud(Integer idSolicitud, Boolean aceptada) {
        Solicitude solicitud = solicitudRepository.findById(idSolicitud).orElse(null);
        if(solicitud != null){
            if (aceptada == true){
                solicitud.setEstado("ACEPTADA");
                solicitudRepository.save(solicitud);
                return "Solicitud aceptada";
            } else {
                solicitud.setEstado("RECHAZADA");
                solicitudRepository.save(solicitud);
                return "Solicitud rechazada";
            }
        } else {
            return "La solicitud no existe";
        }
    }

    @Override
    public List<SolicitudResponse> getSolicitudes(Integer idProfesional, String estado) {
        Profesionale profesionale = profesionalRepository.findById(idProfesional).orElse(null);

        List<Solicitude> solicitudes = solicitudRepository.findByIdprofesionalAndEstado(profesionale, estado);
        List<SolicitudResponse> respuestas = new ArrayList<>();
        if (!solicitudes.isEmpty()) {
            for (Solicitude s : solicitudes){
                SolicitudResponse response = SolicitudResponse.builder()
                        .idSolicitud(s.getId())
                        .nombreUsuario(s.getIdusuario().getIdauth().getName() + " "
                                + s.getIdusuario().getIdauth().getLastname())
                        .nombreProfesional(s.getIdprofesional().getIdusuario().getIdauth().getName()
                                + " " + s.getIdprofesional().getIdusuario().getIdauth().getLastname())
                        .fechasolicitud(s.getFechasolicitud())
                        .fechaservicio(s.getFechaservicio())
                        .direccion(s.getIdusuario().getIddireccion().getCalle() + " "
                                + s.getIdusuario().getIddireccion().getNumero())
                        .observacion(s.getObservacion())
                        .horaReserva(s.getHoraReserva())
                        .build();
                respuestas.add(response);
            }
        }
        return respuestas;
    }

    @Override
    public List<SolicitudUsuarioResponse> getSolicitudByIdUsuario(Integer idUsuario) {
        List<Solicitude> solicitudes = solicitudRepository.findByIdusuario_Id(idUsuario);

        List<SolicitudUsuarioResponse> respuestas = new ArrayList<>();

        if (!solicitudes.isEmpty()) {
            for (Solicitude s : solicitudes) {
                SolicitudUsuarioResponse response = SolicitudUsuarioResponse.builder()
                        .idSolicitud(s.getId())
                        .idProfesional(s.getIdprofesional().getId())
                        .nombreProfesional(s.getIdprofesional().getIdusuario().getIdauth().getName())
                        .apellidoProfesional(s.getIdprofesional().getIdusuario().getIdauth().getLastname())
                        .fechaSolicitud(s.getFechasolicitud())
                        .estado(s.getEstado())
                        .imagenUrl(s.getIdprofesional().getIdusuario().getAvatar())
                        .build();
                respuestas.add(response);
            }
            return respuestas;
        } else {
            throw new RuntimeException("Solicitudes no encontradas");
        }
    }

    @Override
    public List<TurnoDisponibleDTO> obtenerTurnosDisponiblesSemana(
            Integer idProfesional, LocalDate fechaInicio, Integer duracionEstimada) {

        Profesionale profesional = profesionalRepository.findById(idProfesional)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        List<TurnoDisponibleDTO> turnosDisponibles = new ArrayList<>();
        LocalDate fechaFin = fechaInicio.plusDays(7);

        LocalTime horaInicioLaboral = LocalTime.of(8, 0);
        LocalTime horaFinLaboral = LocalTime.of(18, 0);

        for (LocalDate fecha = fechaInicio; fecha.isBefore(fechaFin); fecha = fecha.plusDays(1)) {

            java.time.DayOfWeek diaSemana = fecha.getDayOfWeek();
            if (diaSemana == java.time.DayOfWeek.SATURDAY ||
                    diaSemana == java.time.DayOfWeek.SUNDAY) {
                continue;
            }

            List<Solicitude> turnosOcupados = solicitudRepository
                    .findSolicitudesAceptadasByProfesionalAndFecha(idProfesional, fecha);

            Set<LocalTime> horasOcupadas = new HashSet<>();
            for (Solicitude turno : turnosOcupados) {
                LocalDateTime fechaHoraTurno = LocalDateTime.ofInstant(
                        turno.getFechaservicio(),
                        ZoneId.systemDefault()
                );
                LocalTime horaInicio = fechaHoraTurno.toLocalTime();

                Integer duracion = turno.getDuracionEstimada() != null ?
                        turno.getDuracionEstimada() : duracionEstimada;
                LocalTime horaActualTurno = horaInicio;
                LocalTime horaFinTurno = horaInicio.plusMinutes(duracion);

                while (horaActualTurno.isBefore(horaFinTurno)) {
                    horasOcupadas.add(horaActualTurno);
                    horaActualTurno = horaActualTurno.plusMinutes(duracionEstimada);
                }
            }

            LocalTime horaActual = horaInicioLaboral;
            LocalDate finalFecha = fecha;

            while (horaActual.plusMinutes(duracionEstimada).isBefore(horaFinLaboral) ||
                    horaActual.plusMinutes(duracionEstimada).equals(horaFinLaboral)) {

                if (!horasOcupadas.contains(horaActual)) {
                    turnosDisponibles.add(TurnoDisponibleDTO.builder()
                            .fecha(finalFecha)
                            .horaInicio(horaActual)
                            .horaFin(horaActual.plusMinutes(duracionEstimada))
                            .duracionEstimada(duracionEstimada)
                            .build());
                }

                horaActual = horaActual.plusMinutes(duracionEstimada);
            }
        }

        return turnosDisponibles;
    }

    @Override
    public SolicitudResponse confirmarTurno(Integer idUsuario, Integer idProfesional,
                                            LocalDate fecha, java.time.LocalTime hora,
                                            Integer duracion, String observacion) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Profesionale profesional = profesionalRepository.findById(idProfesional)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        List<Solicitude> turnosOcupados = solicitudRepository
                .findSolicitudesAceptadasByProfesionalAndFecha(idProfesional, fecha);

        LocalTime horaFinNuevoTurno = hora.plusMinutes(duracion);

        for (Solicitude turnoExistente : turnosOcupados) {
            LocalDateTime fechaHoraTurno = LocalDateTime.ofInstant(
                    turnoExistente.getFechaservicio(),
                    ZoneId.systemDefault()
            );
            LocalTime horaInicioExistente = fechaHoraTurno.toLocalTime();
            Integer duracionExistente = turnoExistente.getDuracionEstimada() != null ?
                    turnoExistente.getDuracionEstimada() : duracion;
            LocalTime horaFinExistente = horaInicioExistente.plusMinutes(duracionExistente);

            boolean seSolapan = (hora.isBefore(horaFinExistente) && horaFinNuevoTurno.isAfter(horaInicioExistente));

            if (seSolapan) {
                throw new RuntimeException("El turno seleccionado ya no está disponible");
            }
        }

        java.time.LocalDateTime fechaServicio = java.time.LocalDateTime.of(fecha, hora);
        java.time.Instant fechaServicioInstant = fechaServicio
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant();

        Solicitude turno = Solicitude.builder()
                .idusuario(usuario)
                .idprofesional(profesional)
                .idoficio(profesional.getIdoficio())
                .fechasolicitud(java.time.Instant.now())
                .fechaservicio(fechaServicioInstant)
                .estado("PENDIENTE")
                .esTurno(true)
                .duracionEstimada(duracion)
                .horaReserva(hora.toString())
                .iddireccion(usuario.getIddireccion())
                .observacion(observacion)
                .build();

        solicitudRepository.save(turno);

        return SolicitudResponse.builder()
                .idSolicitud(turno.getId())
                .nombreUsuario(usuario.getIdauth().getName() + " " + usuario.getIdauth().getLastname())
                .nombreProfesional(profesional.getIdusuario().getIdauth().getName() + " " +
                        profesional.getIdusuario().getIdauth().getLastname())
                .fechasolicitud(turno.getFechasolicitud())
                .fechaservicio(turno.getFechaservicio())
                .direccion(usuario.getIddireccion().getCalle() + " " + usuario.getIddireccion().getNumero())
                .observacion(turno.getObservacion())
                .horaReserva(turno.getHoraReserva())
                .build();
    }

    @Override
    public String reprogramarFecha(Integer idSolicitud, ReprogramarRequest request) {
        Solicitude solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!"ACEPTADA".equals(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden reprogramar solicitudes aceptadas");
        }

        Integer idProfesional = solicitud.getIdprofesional().getId();
        LocalDate nuevaFecha = request.getNuevaFecha();
        LocalTime nuevaHora = request.getNuevaHora();
        Integer duracion = request.getDuracion() != null ?
                request.getDuracion() :
                (solicitud.getDuracionEstimada() != null ? solicitud.getDuracionEstimada() : 60);

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime nuevaFechaHora = LocalDateTime.of(nuevaFecha, nuevaHora);

        if (nuevaFechaHora.isBefore(ahora)) {
            throw new RuntimeException("La fecha de reprogramación debe ser futura");
        }

        DayOfWeek diaSemana = nuevaFecha.getDayOfWeek();
        if (diaSemana == DayOfWeek.SATURDAY || diaSemana == DayOfWeek.SUNDAY) {
            throw new RuntimeException("No se pueden programar servicios en fines de semana");
        }

        LocalTime horaInicioLaboral = LocalTime.of(8, 0);
        LocalTime horaFinLaboral = LocalTime.of(18, 0);
        LocalTime horaFinTurno = nuevaHora.plusMinutes(duracion);

        if (nuevaHora.isBefore(horaInicioLaboral) || horaFinTurno.isAfter(horaFinLaboral)) {
            throw new RuntimeException("El horario debe estar entre las 08:00 y 18:00");
        }

        List<Solicitude> turnosOcupados = solicitudRepository
                .findSolicitudesAceptadasByProfesionalAndFecha(idProfesional, nuevaFecha);

        turnosOcupados = turnosOcupados.stream()
                .filter(s -> !s.getId().equals(idSolicitud))
                .collect(Collectors.toList());

        LocalTime horaFinNuevoTurno = nuevaHora.plusMinutes(duracion);

        for (Solicitude turnoExistente : turnosOcupados) {
            LocalDateTime fechaHoraTurno = LocalDateTime.ofInstant(
                    turnoExistente.getFechaservicio(),
                    ZoneId.systemDefault()
            );
            LocalTime horaInicioExistente = fechaHoraTurno.toLocalTime();
            Integer duracionExistente = turnoExistente.getDuracionEstimada() != null ?
                    turnoExistente.getDuracionEstimada() : duracion;
            LocalTime horaFinExistente = horaInicioExistente.plusMinutes(duracionExistente);

            boolean seSolapan = (nuevaHora.isBefore(horaFinExistente) &&
                    horaFinNuevoTurno.isAfter(horaInicioExistente));

            if (seSolapan) {
                throw new RuntimeException(
                        "El horario seleccionado se solapa con otro turno. " +
                                "Turno ocupado de " + horaInicioExistente + " a " + horaFinExistente
                );
            }
        }

        LocalDateTime fechaServicio = LocalDateTime.of(nuevaFecha, nuevaHora);
        Instant fechaServicioInstant = fechaServicio
                .atZone(ZoneId.systemDefault())
                .toInstant();

        solicitud.setFechaservicio(fechaServicioInstant);
        solicitud.setDuracionEstimada(duracion);

        solicitudRepository.save(solicitud);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'a las' HH:mm");
        String fechaFormateada = nuevaFechaHora.format(formatter);

        return "Solicitud reprogramada para el día " + fechaFormateada;
    }

    private boolean verificarDisponibilidad(
            Integer idProfesional,
            LocalDate fecha,
            LocalTime hora,
            Integer duracion,
            Integer idSolicitudExcluir) {

        List<Solicitude> turnosOcupados = solicitudRepository
                .findSolicitudesAceptadasByProfesionalAndFecha(idProfesional, fecha);

        if (idSolicitudExcluir != null) {
            turnosOcupados = turnosOcupados.stream()
                    .filter(s -> !s.getId().equals(idSolicitudExcluir))
                    .collect(Collectors.toList());
        }

        LocalTime horaFinNuevo = hora.plusMinutes(duracion);

        for (Solicitude turno : turnosOcupados) {
            LocalDateTime fechaHoraTurno = LocalDateTime.ofInstant(
                    turno.getFechaservicio(),
                    ZoneId.systemDefault()
            );
            LocalTime horaInicio = fechaHoraTurno.toLocalTime();
            Integer duracionTurno = turno.getDuracionEstimada() != null ?
                    turno.getDuracionEstimada() : duracion;
            LocalTime horaFin = horaInicio.plusMinutes(duracionTurno);

            if (hora.isBefore(horaFin) && horaFinNuevo.isAfter(horaInicio)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public boolean tieneSolicitudPendiente(Integer idUsuario, Integer idProfesional) {
        return solicitudRepository.existsByIdusuario_IdAndIdprofesional_IdAndEstado(
                idUsuario, 
                idProfesional, 
                "PENDIENTE"
        );
    }

    @Override
    public Map<String, Object> getSolicitudConUbicacion(Integer idSolicitud) {
        Map<String, Object> solicitudData = solicitudRepository.findSolicitudConDireccion(idSolicitud);

        if (solicitudData == null) {
            throw new RuntimeException("Solicitud no encontrada");
        }

        return procesarSolicitudConUbicacion(solicitudData);
    }

    @Override
    public List<Map<String, Object>> getSolicitudesByProfesionalConUbicacion(Integer idProfesional) {
        List<Map<String, Object>> solicitudes = solicitudRepository.findSolicitudesByProfesionalConDireccion(idProfesional);

        return solicitudes.stream()
                .map(this::procesarSolicitudConUbicacion)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getSolicitudesByProfesionalConUbicacionPaginado(
            Integer idProfesional, int pagina, int tamanio) {
        
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(pagina, tamanio);
        
        org.springframework.data.domain.Page<Map<String, Object>> paginaSolicitudes = 
            solicitudRepository.findSolicitudesByProfesionalConDireccionPaginado(idProfesional, pageable);
        
        List<Map<String, Object>> solicitudesProcesadas = paginaSolicitudes.getContent().stream()
                .map(this::procesarSolicitudConUbicacion)
                .collect(Collectors.toList());
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("solicitudes", solicitudesProcesadas);
        respuesta.put("paginaActual", paginaSolicitudes.getNumber());
        respuesta.put("tamanioPagina", paginaSolicitudes.getSize());
        respuesta.put("totalElementos", paginaSolicitudes.getTotalElements());
        respuesta.put("totalPaginas", paginaSolicitudes.getTotalPages());
        respuesta.put("tieneSiguiente", paginaSolicitudes.hasNext());
        respuesta.put("tieneAnterior", paginaSolicitudes.hasPrevious());
        
        return respuesta;
    }

    @Override
    public Solicitude getSolicitudById(Integer idSolicitud) {
        return solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    @Override
    public List<PerfilProfesional> getProfesionalesMasSolicitadosUltimoMes() {
        LocalDate fechaHaceUnMes = LocalDate.now().minusMonths(1);
        Instant instantHaceUnMes = fechaHaceUnMes.atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Object[]> resultados = solicitudRepository.findTop3ProfesionalesMasSolicitados(instantHaceUnMes);

        return resultados.stream()
                .map(resultado -> {
                    Integer idProfesional = (Integer) resultado[0];
                    return perfilService.getPerfilProfesional(idProfesional);
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> procesarSolicitudConUbicacion(Map<String, Object> solicitudData) {
        String direccionCompleta = construirDireccionDesdeMap(solicitudData);
        solicitudData.put("direccionCompleta", direccionCompleta);

        try {
            String ciudad = (String) solicitudData.get("ciudad");
            Map<String, Object> coordenadas = openStreetMapService.obtenerCoordenadasPorCiudadEspecifica(
                    direccionCompleta,
                    ciudad
            );

            if ((Boolean) coordenadas.getOrDefault("encontrado", false)) {
                solicitudData.put("latitud", coordenadas.get("latitud"));
                solicitudData.put("longitud", coordenadas.get("longitud"));
                solicitudData.put("ubicacionEncontrada", true);
            } else {
                solicitudData.put("latitud", null);
                solicitudData.put("longitud", null);
                solicitudData.put("ubicacionEncontrada", false);
                solicitudData.put("mensajeUbicacion", coordenadas.get("mensaje"));
            }
        } catch (Exception e) {
            solicitudData.put("latitud", null);
            solicitudData.put("longitud", null);
            solicitudData.put("ubicacionEncontrada", false);
            solicitudData.put("errorUbicacion", "No se pudo geocodificar: " + e.getMessage());
        }

        return solicitudData;
    }

    private String construirDireccionDesdeMap(Map<String, Object> data) {
        StringBuilder direccion = new StringBuilder();

        direccion.append(data.get("calle"))
                .append(" ")
                .append(data.get("numero"));

        String piso = (String) data.get("piso");
        if (piso != null && !piso.trim().isEmpty()) {
            direccion.append(", Piso ").append(piso);
        }

        String depto = (String) data.get("depto");
        if (depto != null && !depto.trim().isEmpty()) {
            direccion.append(", Depto ").append(depto);
        }

        direccion.append(", ")
                .append(data.get("barrio"))
                .append(", ")
                .append(data.get("ciudad"));

        return direccion.toString();
    }

    @Override
    public List<Map<String, Object>> getOficiosMasSolicitados(LocalDate fechaInicio, LocalDate fechaFin) {
        Instant instantInicio = fechaInicio != null
            ? fechaInicio.atStartOfDay(ZoneId.systemDefault()).toInstant()
            : null;
        Instant instantFin = fechaFin != null
            ? fechaFin.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant()
            : null;

        var resultados = oficioRepository.findAllOficiosConCantidadSolicitudes(instantInicio, instantFin);

        return resultados.stream()
                .map(dto -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("oficio", dto.getOficio());
                    map.put("cantidadDeSolicitudes", dto.getCantidadDeSolicitudes());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
