package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.entities.Profesionale;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface BusquedaService {
    List<Profesionale> buscarProfesionalesPorFiltros(String oficio, String zona, String nombre);
    List<Map<String, Object>> buscarProfesionalesConUbicacion(String oficio, String zona, String nombre);
    List<Map<String, Object>> buscarProfesionalesCercanos(double lat, double lon, String oficio, double radioKm);

}
