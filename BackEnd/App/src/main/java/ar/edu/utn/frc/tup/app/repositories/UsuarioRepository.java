package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Auth;
import ar.edu.utn.frc.tup.app.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    Optional<Usuario> findByIdauth(Auth idauth);

    long count();

    @Query("SELECT u FROM Usuario u JOIN u.idauth a WHERE LOWER(CONCAT(a.name, ' ', a.lastname)) LIKE LOWER(CONCAT('%', :nombreCompleto, '%'))")
    List<Usuario> findByNombreCompleto(@Param("nombreCompleto") String nombreCompleto);
}
