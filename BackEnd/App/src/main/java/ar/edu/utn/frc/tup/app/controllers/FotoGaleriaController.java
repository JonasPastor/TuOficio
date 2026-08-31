package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.FotoGaleriaDto;
import ar.edu.utn.frc.tup.app.services.FotoGaleriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/galeria")
@RequiredArgsConstructor
public class FotoGaleriaController {

    private final FotoGaleriaService fotoGaleriaService;

    @GetMapping("/profesional/{idProfesional}")
    public ResponseEntity<?> getFotosByProfesional(@PathVariable Integer idProfesional) {
        try {
            List<FotoGaleriaDto> fotos = fotoGaleriaService.getFotosByProfesional(idProfesional);
            return ResponseEntity.ok(fotos);
        } catch (Exception e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error("Internal Server Error")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/profesional/{idProfesional}")
    public ResponseEntity<?> agregarFoto(
            @PathVariable Integer idProfesional,
            @RequestBody FotoGaleriaDto fotoDto) {
        try {
            FotoGaleriaDto foto = fotoGaleriaService.agregarFoto(idProfesional, fotoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(foto);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/profesional/{idProfesional}/foto/{idFoto}")
    public ResponseEntity<?> eliminarFoto(
            @PathVariable Integer idProfesional,
            @PathVariable Integer idFoto) {
        try {
            fotoGaleriaService.eliminarFoto(idProfesional, idFoto);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
