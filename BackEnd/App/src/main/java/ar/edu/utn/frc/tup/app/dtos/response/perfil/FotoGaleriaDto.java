package ar.edu.utn.frc.tup.app.dtos.response.perfil;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FotoGaleriaDto {
    private Integer id;
    private String urlFoto;
    private String descripcion;
    private LocalDateTime fechaSubida;
    private Integer orden;
}
