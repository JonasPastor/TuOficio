package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.services.BusquedaService;
import ar.edu.utn.frc.tup.app.services.OpenStreetMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/busqueda")
@RequiredArgsConstructor
public class BusquedaController {

    private final OpenStreetMapService openStreetMapService;

    private final BusquedaService busquedaService;

    @GetMapping("/direccion")
    public ResponseEntity<String> buscarPorDireccion(@RequestParam String direccion) {
        try {
            String resultado = openStreetMapService.buscarPorDireccion(direccion);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/direccion-ciudad")
    public ResponseEntity<Map<String, Object>> buscarPorDireccionYCiudad(
            @RequestParam String direccion,
            @RequestParam String ciudad) {
        try {
            Map<String, Object> resultado = openStreetMapService.obtenerCoordenadasPorCiudadEspecifica(direccion, ciudad);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/barrio")
    public ResponseEntity<String> buscarPorBarrio(
            @RequestParam String barrio,
            @RequestParam(defaultValue = "Argentina") String ciudad) {
        try {
            String resultado = openStreetMapService.buscarPorBarrio(barrio, ciudad);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/coordenadas")
    public ResponseEntity<String> buscarPorCoordenadas(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            String resultado = openStreetMapService.buscarCoordenadas(lat, lon);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/profesionales")
    public ResponseEntity<?> buscarProfesionales(
            @RequestParam(required = false) String oficio,
            @RequestParam(required = false) String zona,
            @RequestParam(required = false) String nombre) {
        try {
            List<Map<String, Object>> profesionales = busquedaService.buscarProfesionalesConUbicacion(oficio, zona, nombre);
            if (profesionales.isEmpty()) {
                return ResponseEntity.ok(Map.of("mensaje", "No se encontraron profesionales"));
            }
            return ResponseEntity.ok(profesionales);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/profesionales/cercanos")
    public ResponseEntity<List<Map<String, Object>>> buscarProfesionalesCercanos(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String oficio,
            @RequestParam(defaultValue = "10") double radio) {
        try {
            List<Map<String, Object>> profesionales = busquedaService.buscarProfesionalesCercanos(lat, lon, oficio, radio);
            return ResponseEntity.ok(profesionales);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


