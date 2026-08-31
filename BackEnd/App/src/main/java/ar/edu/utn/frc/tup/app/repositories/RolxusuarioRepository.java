package ar.edu.utn.frc.tup.app.repositories;

import ar.edu.utn.frc.tup.app.entities.Auth;
import ar.edu.utn.frc.tup.app.entities.Role;
import ar.edu.utn.frc.tup.app.entities.Rolxusuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolxusuarioRepository extends JpaRepository<Rolxusuario, Integer> {
    boolean existsByIdauthAndIdrol(Auth idauth, Role idrol);
    List<Rolxusuario> findByIdauth(Auth idauth);
}
