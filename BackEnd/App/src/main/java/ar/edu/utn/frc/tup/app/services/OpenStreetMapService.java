package ar.edu.utn.frc.tup.app.services;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public interface OpenStreetMapService {
    String buscarPorDireccion(String direccion);
    String buscarPorBarrio(String barrio, String ciudad);
    String buscarCoordenadas(double lat, double lon);
    Map<String, Object> obtenerCoordenadasPorCiudadEspecifica(String direccion, String ciudadBuscada);
    Map<String, Double> obtenerCoordenadasSimple(String direccion, String ciudad);
}

