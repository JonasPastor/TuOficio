package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import ar.edu.utn.frc.tup.app.dtos.common.ErrorApi;
import ar.edu.utn.frc.tup.app.dtos.request.resenia.ReseniaRequest;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.PuntuacionProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.ReseniaUser;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.TopProfesionales;
import ar.edu.utn.frc.tup.app.services.ReseniaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/resenias")
@RequiredArgsConstructor
public class ReseniaController {

    private final ReseniaService reseniaService;

    @PostMapping("/puntuar/")
    public ResponseEntity<?> puntuarResenia(@RequestBody ReseniaRequest reseniaRequest){
        try{
            return ResponseEntity.status(201).body(reseniaService.puntuarResenia(reseniaRequest));
        } catch (RuntimeException e){
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/promedio/{idProfesional}")
    public ResponseEntity<?> getPromedioProfesional(@PathVariable Integer idProfesional){
        PuntuacionProfesional puntuacion = reseniaService.getPromedioProfesional(idProfesional);
        if (puntuacion == null) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(java.time.Instant.now().toString())
                    .status(HttpStatus.NOT_FOUND.value())
                    .error("Not Found")
                    .message("Este profesional no tiene puntuaciones")
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(puntuacion.getPuntuacion());
    }

    @GetMapping("/resenas/{idProfesional}")
    public ResponseEntity<?> getReseniasDeProfesional(@PathVariable Integer idProfesional){
        List<ReseniaUser> resenias = reseniaService.getReseniasDeProfesional(idProfesional);
        if (resenias.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(resenias);
    }

    @GetMapping("/top-profesionales")
    public ResponseEntity<?> getTopProfesionales() {
        try {
            List<TopProfesionales> topProfesionales =
                    reseniaService.getPosicionamientoSegunPuntuacion();

            return ResponseEntity.ok(topProfesionales);
        } catch (RuntimeException e) {
            ErrorApi error = ErrorApi.builder()
                    .timestamp(Instant.now().toString())
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .error("Internal Server Error")
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
