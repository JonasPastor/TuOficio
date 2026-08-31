package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.services.OpenStreetMapService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.Map;

@Service
public class OpenStreetMapServiceImpl implements OpenStreetMapService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenStreetMapServiceImpl() {
        this.webClient = WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "SpringBootApp/1.0")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String buscarPorDireccion(String direccion) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", direccion)
                            .queryParam("format", "json")
                            .queryParam("limit", "10")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Error al buscar dirección: " + e.getMessage());
        }
    }

    @Override
    public String buscarPorBarrio(String barrio, String ciudad) {
        String query = barrio + ", " + ciudad;
        return buscarPorDireccion(query);
    }

    @Override
    public String buscarCoordenadas(double lat, double lon) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/reverse")
                            .queryParam("lat", lat)
                            .queryParam("lon", lon)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Error al buscar coordenadas: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> obtenerCoordenadasPorCiudadEspecifica(String direccion, String ciudadBuscada) {
        try {
            String respuestaJson = buscarPorDireccion(direccion + ", " + ciudadBuscada);
            JsonNode resultados = objectMapper.readTree(respuestaJson);

            Map<String, Object> resultado = new HashMap<>();

            if (resultados.isArray() && resultados.size() > 0) {
                for (JsonNode nodo : resultados) {
                    String displayName = nodo.get("display_name").asText();

                    if (esLaCiudadCorrecta(displayName, ciudadBuscada)) {
                        resultado.put("latitud", nodo.get("lat").asDouble());
                        resultado.put("longitud", nodo.get("lon").asDouble());
                        resultado.put("direccionCompleta", displayName);
                        resultado.put("encontrado", true);
                        return resultado;
                    }
                }

                JsonNode primerResultado = resultados.get(0);
                resultado.put("latitud", primerResultado.get("lat").asDouble());
                resultado.put("longitud", primerResultado.get("lon").asDouble());
                resultado.put("direccionCompleta", primerResultado.get("display_name").asText());
                resultado.put("encontrado", false);
                resultado.put("advertencia", "No se encontró en " + ciudadBuscada + " específicamente, se tomó el primer resultado");
            } else {
                resultado.put("encontrado", false);
                resultado.put("mensaje", "No se encontraron resultados para la dirección");
            }

            return resultado;

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("encontrado", false);
            error.put("error", e.getMessage());
            return error;
        }
    }

    private boolean esLaCiudadCorrecta(String displayName, String ciudadBuscada) {
        String displayLower = displayName.toLowerCase();
        String ciudadLower = ciudadBuscada.toLowerCase();

        if (ciudadLower.equals("córdoba") || ciudadLower.equals("cordoba")) {
            return displayLower.contains("córdoba, provincia de córdoba") ||
                    displayLower.contains("ciudad de córdoba") ||
                    displayLower.contains("capital, córdoba") ||
                    (displayLower.contains("córdoba") && displayLower.contains("capital"));
        }

        if (ciudadLower.equals("buenos aires")) {
            return displayLower.contains("ciudad autónoma de buenos aires") ||
                    displayLower.contains("capital federal") ||
                    displayLower.contains("caba");
        }

        return displayLower.contains(ciudadLower + ",") ||
                displayLower.contains("ciudad de " + ciudadLower) ||
                displayLower.contains(ciudadLower + " ciudad");
    }

    @Override
    public Map<String, Double> obtenerCoordenadasSimple(String direccion, String ciudad) {
        Map<String, Object> resultado = obtenerCoordenadasPorCiudadEspecifica(direccion, ciudad);
        Map<String, Double> coordenadas = new HashMap<>();

        if ((Boolean) resultado.getOrDefault("encontrado", false)) {
            coordenadas.put("lat", (Double) resultado.get("latitud"));
            coordenadas.put("lon", (Double) resultado.get("longitud"));
        }

        return coordenadas;
    }
}

