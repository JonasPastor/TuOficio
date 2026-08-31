package ar.edu.utn.frc.tup.app.dtos.response.perfil;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PerfilProfesional {
    private Integer idProfesional;
    private String nombre;
    private String apellido;
    private String email;
    private String avatar;
    private String oficio;
    private String telefono;
    private String rangoPrecio;
    private List<String> especialidades;
    private Double puntuacionPromedio;
    private Long cantidadResenias;
    private Integer serviciosCompletados;
    private List<FotoGaleriaDto> fotosGaleria;
}
