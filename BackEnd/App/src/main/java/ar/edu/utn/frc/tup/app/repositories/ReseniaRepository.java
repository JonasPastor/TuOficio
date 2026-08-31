package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Resenia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReseniaRepository extends JpaRepository<Resenia,Integer> {
    List<Resenia> findByIdprofesional_Id(Integer id);

    @Query("SELECT AVG(r.puntuacion) FROM Resenia r WHERE r.idprofesional.id = :idProfesional")
    Double getPromedioPuntuacionByProfesional(@Param("idProfesional") Integer idProfesional);

    @Query("SELECT COUNT(r) FROM Resenia r WHERE r.idprofesional.id = :idProfesional")
    Long countReseniasByProfesional(@Param("idProfesional") Integer idProfesional);

    @Query("SELECT COUNT(r) FROM Resenia r WHERE r.idusuario.id = :idUsuario AND r.idprofesional.id = :idProfesional")
    Long countByUsuarioAndProfesional(@Param("idUsuario") Integer idUsuario, @Param("idProfesional") Integer idProfesional);

    @Query("SELECT COUNT(r) FROM Resenia r WHERE r.trabajo.id = :idTrabajo")
    Long countByTrabajo(@Param("idTrabajo") Integer idTrabajo);
}
