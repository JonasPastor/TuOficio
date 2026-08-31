package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Integer> {
    
    @Query("SELECT r FROM Reporte r " +
            "LEFT JOIN FETCH r.idprofesional p " +
            "LEFT JOIN FETCH p.idusuario " +
            "LEFT JOIN FETCH r.reportadoPor " +
            "WHERE r.atendido = false " +
            "ORDER BY r.fechaReporte DESC")
    List<Reporte> findAllPendientes();
    
    @Query("SELECT r FROM Reporte r " +
            "LEFT JOIN FETCH r.idprofesional p " +
            "LEFT JOIN FETCH p.idusuario " +
            "LEFT JOIN FETCH r.reportadoPor " +
            "WHERE r.idprofesional.id = :idProfesional " +
            "ORDER BY r.fechaReporte DESC")
    List<Reporte> findByProfesionalId(@Param("idProfesional") Integer idProfesional);
    
    @Query("SELECT r FROM Reporte r " +
            "LEFT JOIN FETCH r.idprofesional p " +
            "LEFT JOIN FETCH p.idusuario " +
            "LEFT JOIN FETCH r.reportadoPor " +
            "ORDER BY r.fechaReporte DESC")
    List<Reporte> findAllWithDetails();
}
