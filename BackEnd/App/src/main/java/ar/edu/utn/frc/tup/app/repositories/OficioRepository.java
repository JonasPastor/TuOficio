package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OficioRepository extends JpaRepository<Oficio,Integer> {
    @Query("SELECT DISTINCT o FROM Oficio o " +
            "JOIN Profesionale p ON p.idoficio.id = o.id")
    List<Oficio> findAllWithProfesionales();
    List<Oficio> findByActivoTrue();
    @Query("SELECT o FROM Oficio o WHERE o.activo = false")
    List<Oficio> findByActivoFalse();
    Optional<Oficio> findByOficioAndActivoTrue(String oficio);
    @Query("""
    SELECT new ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud(
        o.oficio,
        COUNT(s.id)
    )
    FROM Oficio o
    JOIN Solicitude s ON s.idoficio = o
    WHERE o.activo = TRUE
    GROUP BY o.oficio
    ORDER BY COUNT(s.id) DESC
    """)
    List<OficioXSolicitud> findOficiosMasDemandados();

    @Query("""
    SELECT new ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud(
        o.oficio,
        COUNT(s.id)
    )
    FROM Oficio o
    LEFT JOIN Solicitude s ON s.idoficio = o
        AND s.fechasolicitud >= COALESCE(:fechaInicio, s.fechasolicitud)
        AND s.fechasolicitud <= COALESCE(:fechaFin, s.fechasolicitud)
    WHERE o.activo = TRUE
    GROUP BY o.oficio
    ORDER BY COUNT(s.id) DESC
    """)
    List<OficioXSolicitud> findAllOficiosConCantidadSolicitudes(
            @org.springframework.data.repository.query.Param("fechaInicio") java.time.Instant fechaInicio,
            @org.springframework.data.repository.query.Param("fechaFin") java.time.Instant fechaFin
    );
}
