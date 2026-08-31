package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.entities.Profesionale;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.services.BusquedaService;
import ar.edu.utn.frc.tup.app.services.OpenStreetMapService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BusquedaServiceImpl implements BusquedaService {

    private final ProfesionalRepository profesionalRepository;

    private final OpenStreetMapService openStreetMapService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Profesionale> buscarProfesionalesPorFiltros(String oficio, String zona, String nombre) {
        if (nombre != null && !nombre.isEmpty()) {
            return profesionalRepository.findByIdusuario_Idauth_NameContainingIgnoreCaseOrIdusuario_Idauth_LastnameContainingIgnoreCase(nombre, nombre);
        }
        if (oficio != null && zona != null) {
            return profesionalRepository.findByOficioAndZona(oficio, zona);
        } else if (oficio != null) {
            return profesionalRepository.findByOficioSimple(oficio);
        } else if (zona != null) {
            return profesionalRepository.findByZona(zona);
        } else {
            return profesionalRepository.findProfesionalesActivos();
        }
    }

    public List<Map<String, Object>> buscarProfesionalesConUbicacion(String oficio, String zona, String nombre) {
        List<Profesionale> profesionales = buscarProfesionalesPorFiltros(oficio, zona, nombre);
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (Profesionale prof : profesionales) {
            Map<String, Object> profesionalConUbicacion = new HashMap<>();

            profesionalConUbicacion.put("id", prof.getId());
            profesionalConUbicacion.put("fechaDesde", prof.getFechadesde());
            profesionalConUbicacion.put("fechaHasta", prof.getFechahasta());

            profesionalConUbicacion.put("nombre", prof.getIdusuario().getIdauth().getName());
            profesionalConUbicacion.put("apellido", prof.getIdusuario().getIdauth().getLastname());
            profesionalConUbicacion.put("email", prof.getIdusuario().getIdauth().getMail());
            profesionalConUbicacion.put("telefono", prof.getIdusuario().getTelefono());
            profesionalConUbicacion.put("oficio", prof.getIdoficio().getOficio());

            String direccionCompleta = construirDireccionCompleta(prof);
            profesionalConUbicacion.put("direccion", direccionCompleta);
            profesionalConUbicacion.put("barrio", prof.getIdusuario().getIddireccion().getIdbarrio().getBarrio());
            profesionalConUbicacion.put("ciudad", prof.getIdusuario().getIddireccion().getIdbarrio().getIdciudad().getCiudad());

            try {
                Map<String, Double> coordenadas = obtenerCoordenadasOSM(direccionCompleta);
                profesionalConUbicacion.put("latitud", coordenadas.get("lat"));
                profesionalConUbicacion.put("longitud", coordenadas.get("lon"));
            } catch (Exception e) {
                profesionalConUbicacion.put("latitud", null);
                profesionalConUbicacion.put("longitud", null);
                profesionalConUbicacion.put("errorUbicacion", "No se pudo geocodificar la dirección");
            }

            resultado.add(profesionalConUbicacion);
        }

        return resultado;
    }


    private String construirDireccionCompleta(Profesionale profesional) {
        var direccion = profesional.getIdusuario().getIddireccion();
        StringBuilder direccionCompleta = new StringBuilder();

        direccionCompleta.append(direccion.getCalle())
                .append(" ")
                .append(direccion.getNumero());

        if (direccion.getPiso() != null && !direccion.getPiso().trim().isEmpty()) {
            direccionCompleta.append(", Piso ").append(direccion.getPiso());
        }

        if (direccion.getDepto() != null && !direccion.getDepto().trim().isEmpty()) {
            direccionCompleta.append(", Depto ").append(direccion.getDepto());
        }

        direccionCompleta.append(", ")
                .append(direccion.getIdbarrio().getBarrio())
                .append(", ")
                .append(direccion.getIdbarrio().getIdciudad().getCiudad());

        return direccionCompleta.toString();
    }

    private Map<String, Double> obtenerCoordenadasOSM(String direccion) throws Exception {
        String respuesta = openStreetMapService.buscarPorDireccion(direccion);
        JsonNode jsonResponse = objectMapper.readTree(respuesta);

        Map<String, Double> coordenadas = new HashMap<>();

        if (jsonResponse.isArray() && jsonResponse.size() > 0) {
            JsonNode firstResult = jsonResponse.get(0);
            coordenadas.put("lat", firstResult.get("lat").asDouble());
            coordenadas.put("lon", firstResult.get("lon").asDouble());
        } else {
            throw new Exception("No se encontraron coordenadas para la dirección: " + direccion);
        }

        return coordenadas;
    }

    public List<Map<String, Object>> buscarProfesionalesCercanos(double lat, double lon, String oficio, double radioKm) {
        List<Map<String, Object>> todosProfesionales = buscarProfesionalesConUbicacion(oficio, null, null);
        List<Map<String, Object>> profesionalesCercanos = new ArrayList<>();

        for (Map<String, Object> prof : todosProfesionales) {
            Double profLat = (Double) prof.get("latitud");
            Double profLon = (Double) prof.get("longitud");

            if (profLat != null && profLon != null) {
                double distancia = calcularDistancia(lat, lon, profLat, profLon);
                if (distancia <= radioKm) {
                    prof.put("distancia", Math.round(distancia * 100.0) / 100.0); // Redondear a 2 decimales
                    profesionalesCercanos.add(prof);
                }
            }
        }

        profesionalesCercanos.sort((p1, p2) ->
                Double.compare((Double) p1.get("distancia"), (Double) p2.get("distancia")));

        return profesionalesCercanos;
    }

    private double calcularDistancia(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
