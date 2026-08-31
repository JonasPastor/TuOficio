package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.request.oficio.OficioRequest;
import ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OficioService {

    List<Oficio> getAllOficios();
    List<Oficio> getAllOficiosIncludingInactive();
    void desactivarOficio(Integer idOficio);
    void activarOficio(Integer idOficio);
    List<OficioXSolicitud> getOficiosMasDemandados();
    Oficio crearOficio(OficioRequest oficio, Integer idAdmin);
}
