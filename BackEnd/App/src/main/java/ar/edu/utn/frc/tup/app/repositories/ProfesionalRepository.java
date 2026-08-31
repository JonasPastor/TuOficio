package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Profesionale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ProfesionalRepository extends JpaRepository<Profesionale, Integer> {
    @Query("SELECT DISTINCT p FROM Profesionale p " +
            "LEFT JOIN FETCH p.especialidades " +
            "JOIN p.idoficio o " +
            "JOIN p.idusuario u " +
            "JOIN u.iddireccion d " +
            "JOIN d.idbarrio b " +
            "JOIN b.idciudad c " +
            "WHERE (:oficio IS NULL OR LOWER(o.oficio) LIKE LOWER(CONCAT('%', :oficio, '%'))) " +
            "AND (:zona IS NULL OR LOWER(b.barrio) LIKE LOWER(CONCAT('%', :zona, '%')) " +
            "    OR LOWER(c.ciudad) LIKE LOWER(CONCAT('%', :zona, '%')))")
    List<Profesionale> findByOficioAndZona(@Param("oficio") String oficio, @Param("zona") String zona);

    @Query("SELECT p FROM Profesionale p " +
            "WHERE LOWER(p.idoficio.oficio) LIKE LOWER(CONCAT('%', :oficio, '%'))")
    List<Profesionale> findByOficioSimple(@Param("oficio") String oficio);

    @Query("SELECT DISTINCT p FROM Profesionale p " +
            "LEFT JOIN FETCH p.especialidades " +
            "JOIN p.idusuario u " +
            "JOIN u.iddireccion d " +
            "JOIN d.idbarrio b " +
            "JOIN b.idciudad c " +
            "WHERE LOWER(b.barrio) LIKE LOWER(CONCAT('%', :zona, '%')) " +
            "   OR LOWER(c.ciudad) LIKE LOWER(CONCAT('%', :zona, '%'))")
    List<Profesionale> findByZona(@Param("zona") String zona);

    @Query("SELECT DISTINCT p FROM Profesionale p " +
            "LEFT JOIN FETCH p.especialidades " +
            "JOIN p.idusuario u " +
            "JOIN u.iddireccion d " +
            "JOIN d.idbarrio b " +
            "JOIN b.idciudad c " +
            "WHERE p.fechahasta IS NULL OR p.fechahasta >= CURRENT_DATE")
    List<Profesionale> findProfesionalesActivos();

    @Query("SELECT p FROM Profesionale p " +
            "LEFT JOIN FETCH p.especialidades " +
            "WHERE p.idusuario.id = :idUsuario")
    Optional<Profesionale> findByIdusuario_Id(@Param("idUsuario") Integer idUsuario);

    @Query("SELECT p FROM Profesionale p ORDER BY p.idoficio.id")
    List<Profesionale> findAllOrderedByOficio();

    @Query("SELECT p FROM Profesionale p WHERE p.idoficio.id = :idOficio")
    List<Profesionale> findByIdOficio(@Param("idOficio") Integer idOficio);

    long count();

    List<Profesionale> findByIdusuario_Idauth_NameContainingIgnoreCaseOrIdusuario_Idauth_LastnameContainingIgnoreCase(String name, String lastname);

    @Query("SELECT p FROM Profesionale p JOIN p.idusuario u JOIN u.idauth a WHERE LOWER(CONCAT(a.name, ' ', a.lastname)) LIKE LOWER(CONCAT('%', :nombreCompleto, '%'))")
    List<Profesionale> findByNombreCompleto(@Param("nombreCompleto") String nombreCompleto);
}
