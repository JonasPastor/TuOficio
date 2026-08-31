package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.request.resenia.ReseniaRequest;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.PuntuacionProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.ReseniaResponse;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.ReseniaUser;
import ar.edu.utn.frc.tup.app.dtos.response.resenia.TopProfesionales;

import java.util.List;

public interface ReseniaService {
    ReseniaResponse puntuarResenia(ReseniaRequest reseniaRequest);
    PuntuacionProfesional getPromedioProfesional(Integer idProfesional);
    List<ReseniaUser> getReseniasDeProfesional(Integer idProfesional);
    List<TopProfesionales> getPosicionamientoSegunPuntuacion();
}
