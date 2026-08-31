package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.entities.Direccione;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import ar.edu.utn.frc.tup.app.services.DomicilioService;
import io.swagger.v3.oas.annotations.tags.Tags;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/domicilio")
@RequiredArgsConstructor
@Tags(value = {@io.swagger.v3.oas.annotations.tags.Tag(name = "Direcciones")})
public class DireccionController {
    private final DomicilioService domicilioService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> getDireccion(@PathVariable int idUsuario) {
        DomicilioDto domicilio = domicilioService.getDomicilioUsuario(idUsuario);
        if (domicilio == null) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Domicilio no encontrado")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(domicilio);
    }
}
