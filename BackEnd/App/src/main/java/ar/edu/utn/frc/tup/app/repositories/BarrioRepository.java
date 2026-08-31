package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Barrio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarrioRepository extends JpaRepository<Barrio, Integer> {
    List<Barrio> findByIdciudad_Ciudad(String ciudad);
}
