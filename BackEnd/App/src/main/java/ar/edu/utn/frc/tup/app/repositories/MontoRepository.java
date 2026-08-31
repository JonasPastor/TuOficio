package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Monto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MontoRepository extends JpaRepository<Monto, Integer> {
    Optional<Monto> findByIdprofesional_Id(Integer idProfesional);
}
