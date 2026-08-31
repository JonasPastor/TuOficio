package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.request.oficio.OficioRequest;
import ar.edu.utn.frc.tup.app.dtos.response.oficio.OficioXSolicitud;
import ar.edu.utn.frc.tup.app.entities.Oficio;
import ar.edu.utn.frc.tup.app.repositories.OficioRepository;
import ar.edu.utn.frc.tup.app.services.OficioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OficioServiceImpl implements OficioService {

    private final OficioRepository oficioRepository;

    @Override
    public List<Oficio> getAllOficios() {
        return oficioRepository.findByActivoTrue();
    }

    @Override
    public List<Oficio> getAllOficiosIncludingInactive() {
        return oficioRepository.findAll();
    }

    @Override
    public void desactivarOficio(Integer idOficio) {
        Oficio oficio = oficioRepository.findById(idOficio)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado"));

        oficio.setActivo(false);
        oficioRepository.save(oficio);
    }

    @Override
    public void activarOficio(Integer idOficio) {
        Oficio oficio = oficioRepository.findById(idOficio)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado"));

        oficio.setActivo(true);
        oficioRepository.save(oficio);
    }

    @Override
    public List<OficioXSolicitud> getOficiosMasDemandados() {
        return oficioRepository.findOficiosMasDemandados();
    }

    @Override
    public Oficio crearOficio(OficioRequest oficioRequest, Integer idAdmin) {
        Oficio oficio = new Oficio();
        oficio.setOficio(oficioRequest.getNombre());
        return oficioRepository.save(oficio);
    }
}
