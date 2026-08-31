package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.entities.Barrio;
import ar.edu.utn.frc.tup.app.entities.Ciudade;
import ar.edu.utn.frc.tup.app.entities.Departamento;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface DepartamentoService {
    List<Departamento> getAllDepartamentos();
    Optional<Departamento> getDepartamentoById(int id);
    List<Ciudade> getAllCiudades();
    Optional<Ciudade> getCiudadById(int id);
    List<Barrio> getAllBarrios();
    Optional<Barrio> getBarrioById(int id);
    List<Barrio> getBarriosByCiudadId(int ciudadId);
    List<Ciudade> getCiudadesByDepartamentoId(int departamentoId);
}
