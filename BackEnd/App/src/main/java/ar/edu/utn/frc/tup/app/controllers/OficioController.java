package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.oficio.OficioRequest;
import ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import ar.edu.utn.frc.tup.app.services.OficioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/oficios")
@RequiredArgsConstructor
public class OficioController {

    private final OficioService oficioService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllOficios() {
        List<Oficio> oficios = oficioService.getAllOficios();
        if (oficios.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Oficios no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(oficios);
    }

    @GetMapping("/all-inactive")
    public ResponseEntity<?> getAllOficiosIncludingInactive() {
        List<Oficio> oficios = oficioService.getAllOficiosIncludingInactive();
        if (oficios.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Oficios no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(oficios);
    }

    @PutMapping("/desactivar/{id}")
    public ResponseEntity<?> desactivarOficio(@PathVariable Integer id) {
        try {
            oficioService.desactivarOficio(id);
            return ResponseEntity.ok("Oficio desactivado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/activar/{id}")
    public ResponseEntity<?> activarOficio(@PathVariable Integer id) {
        try {
            oficioService.activarOficio(id);
            return ResponseEntity.ok("Oficio activado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/oficios-demandados")
    public ResponseEntity<?> getOficiosMasDemandados() {
        List<OficioXSolicitud> oficios = oficioService.getOficiosMasDemandados();
        if (oficios.isEmpty()) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Oficios no encontrados")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(oficios);
    }

    @PostMapping("/crear/{idAdmin}")
    public ResponseEntity<?> crearOficio(@RequestBody OficioRequest oficioRequest,
                                         @PathVariable Integer idAdmin) {
        try {
            Oficio nuevoOficio = oficioService.crearOficio(oficioRequest, idAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoOficio);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
