package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.response.perfil.FotoGaleriaDto;
import ar.edu.utn.frc.tup.app.entities.FotoGaleria;
import ar.edu.utn.frc.tup.app.entities.Profesionale;
import ar.edu.utn.frc.tup.app.repositories.FotoGaleriaRepository;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.services.FotoGaleriaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FotoGaleriaServiceImpl implements FotoGaleriaService {

    private final FotoGaleriaRepository fotoGaleriaRepository;
    private final ProfesionalRepository profesionalRepository;

    @Override
    public List<FotoGaleriaDto> getFotosByProfesional(Integer idProfesional) {
        List<FotoGaleria> fotos = fotoGaleriaRepository.findByProfesionalIdOrderByOrdenAsc(idProfesional);
        return fotos.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FotoGaleriaDto agregarFoto(Integer idProfesional, FotoGaleriaDto fotoDto) {
        System.out.println("Agregando foto para profesional ID: " + idProfesional);
        System.out.println("FotoDto recibido: " + fotoDto);
        
        Profesionale profesional = profesionalRepository.findById(idProfesional)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        
        System.out.println("Profesional encontrado: " + profesional.getId());

        FotoGaleria foto = new FotoGaleria();
        foto.setProfesional(profesional);
        foto.setUrlFoto(fotoDto.getUrlFoto());
        foto.setDescripcion(fotoDto.getDescripcion());
        foto.setFechaSubida(LocalDateTime.now());
        foto.setOrden(fotoDto.getOrden() != null ? fotoDto.getOrden() : 0);
        
        System.out.println("FotoGaleria antes de guardar - Profesional: " + foto.getProfesional());
        System.out.println("FotoGaleria antes de guardar - URL: " + foto.getUrlFoto());

        foto = fotoGaleriaRepository.save(foto);
        
        System.out.println("Foto guardada con ID: " + foto.getId());
        
        return mapToDto(foto);
    }

    @Override
    @Transactional
    public void eliminarFoto(Integer idProfesional, Integer idFoto) {
        FotoGaleria foto = fotoGaleriaRepository.findById(idFoto)
                .orElseThrow(() -> new RuntimeException("Foto no encontrada"));

        if (!foto.getProfesional().getId().equals(idProfesional)) {
            throw new RuntimeException("La foto no pertenece a este profesional");
        }

        fotoGaleriaRepository.delete(foto);
    }

    private FotoGaleriaDto mapToDto(FotoGaleria foto) {
        return FotoGaleriaDto.builder()
                .id(foto.getId())
                .urlFoto(foto.getUrlFoto())
                .descripcion(foto.getDescripcion())
                .fechaSubida(foto.getFechaSubida())
                .orden(foto.getOrden())
                .build();
    }
}
