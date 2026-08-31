package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.response.perfil.FotoGaleriaDto;

import java.util.List;

public interface FotoGaleriaService {
    List<FotoGaleriaDto> getFotosByProfesional(Integer idProfesional);
    FotoGaleriaDto agregarFoto(Integer idProfesional, FotoGaleriaDto fotoDto);
    void eliminarFoto(Integer idProfesional, Integer idFoto);
}
