package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Trabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrabajoRepository extends JpaRepository<Trabajo, Integer> {

    Optional<Trabajo> findBySolicitud_Id(Integer idSolicitud);

    @Query("SELECT t FROM Trabajo t JOIN t.solicitud s WHERE s.idprofesional.id = :idProfesional")
    List<Trabajo> findByProfesional_Id(@Param("idProfesional") Integer idProfesional);

    @Query("SELECT t FROM Trabajo t " +
            "JOIN t.solicitud s " +
            "WHERE s.idprofesional.id = :idProfesional AND t.estado = :estado")
    List<Trabajo> findByProfesionalAndEstado(
            @Param("idProfesional") Integer idProfesional,
            @Param("estado") String estado
    );

    @Query("SELECT t FROM Trabajo t " +
            "WHERE t.estado = 'FINALIZADO' AND t.factura IS NULL")
    List<Trabajo> findTrabajosFinalizadosSinFactura();

    @Query("SELECT t FROM Trabajo t " +
            "JOIN t.solicitud s " +
            "WHERE s.idusuario.id = :idUsuario")
    List<Trabajo> findByUsuario(@Param("idUsuario") Integer idUsuario);

    @Query("SELECT t FROM Trabajo t " +
            "JOIN t.solicitud s " +
            "WHERE s.idusuario.id = :idUsuario AND t.estado = :estado")
    List<Trabajo> findByUsuarioAndEstado(
            @Param("idUsuario") Integer idUsuario,
            @Param("estado") String estado
    );

    @Query("SELECT COUNT(t) FROM Trabajo t " +
            "JOIN t.solicitud s " +
            "WHERE s.idprofesional.id = :idProfesional AND t.estado = :estado")
    Long countByProfesionalAndEstado(
            @Param("idProfesional") Integer idProfesional,
            @Param("estado") String estado
    );
}
