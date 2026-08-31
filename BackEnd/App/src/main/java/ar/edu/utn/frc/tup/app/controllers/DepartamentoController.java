package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.entities.Barrio;
import ar.edu.utn.frc.tup.app.entities.Ciudade;
import ar.edu.utn.frc.tup.app.entities.Departamento;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import ar.edu.utn.frc.tup.app.services.DepartamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/domicilios")
@RequiredArgsConstructor
public class DepartamentoController {

    private final DepartamentoService departamentoService;

    @GetMapping("/departamentos/all")
    public ResponseEntity<?> getAllDepartamentos() {
        List<Departamento> departamentos = departamentoService.getAllDepartamentos();
        if (departamentos.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Departamentos no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(departamentos);
    }

    @GetMapping("/ciudades/all")
    public ResponseEntity<?> getAllCiudades() {
        List<Ciudade> ciudades = departamentoService.getAllCiudades();
        if (ciudades.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Ciudades no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(ciudades);
    }

    @GetMapping("/barrios/all")
    public ResponseEntity<?> getAllBarrios() {
        List<Barrio> barrios = departamentoService.getAllBarrios();
        if (barrios.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Barrios no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(barrios);
    }

    @GetMapping(value = "/departamento/{id}")
    public ResponseEntity<?> getDepartamentoById(@PathVariable int id) {
        Optional<Departamento> departamento = departamentoService.getDepartamentoById(id);
        if (departamento == null) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Departamento no encontrado")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(departamento);
    }

    @GetMapping(value = "/ciudad/{id}")
    public ResponseEntity<?> getCiudadById(@PathVariable int id) {
        Optional<Ciudade> ciudad = departamentoService.getCiudadById(id);
        if (ciudad == null) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Ciudad no encontrado")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(ciudad);
    }

    @GetMapping(value = "/barrio/{id}")
    public ResponseEntity<?> getBarrioById(@PathVariable int id) {
        Optional<Barrio> barrio = departamentoService.getBarrioById(id);
        if (barrio == null) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Barrio no encontrado")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(barrio);
    }

    @GetMapping("/barrio/ciudad/{ciudadId}")
    public ResponseEntity<?> getBarriosByCiudadId(@PathVariable int ciudadId) {
        List<Barrio> barrios = departamentoService.getBarriosByCiudadId(ciudadId);
        if (barrios.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Barrios no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(barrios);
    }

    @GetMapping("/ciudad/departamento/{departamentoId}")
    public ResponseEntity<?> getCiudadesByDepartamentoId(@PathVariable int departamentoId) {
        List<Ciudade> ciudades = departamentoService.getCiudadesByDepartamentoId(departamentoId);
        if (ciudades.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Ciudades no encontradas")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(ciudades);
    }
}
