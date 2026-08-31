package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.FotoGaleria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoGaleriaRepository extends JpaRepository<FotoGaleria, Integer> {
    
    List<FotoGaleria> findByProfesionalIdOrderByOrdenAsc(Integer idProfesional);
    
    void deleteByProfesionalIdAndId(Integer idProfesional, Integer idFoto);
}
