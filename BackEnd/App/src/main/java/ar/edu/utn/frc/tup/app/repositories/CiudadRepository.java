package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Barrio;
import ar.edu.utn.frc.tup.app.entities.Ciudade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudade, Integer> {
    List<Ciudade> findByIddepartamento_Departamento(String departamento);
}
