package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import ar.edu.utn.frc.tup.app.entities.Direccione;
import ar.edu.utn.frc.tup.app.repositories.*;
import ar.edu.utn.frc.tup.app.services.DomicilioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DomicilioServiceImpl implements DomicilioService {

    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final BarrioRepository barrioRepository;
    private final CiudadRepository ciudadRepository;
    private final DepartamentoRepository departamentoRepository;

    @Override
    public DomicilioDto getDomicilioUsuario(int idUsuario) {
        var usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario != null) {
            Direccione direccion = usuario.getIddireccion();
            if (direccion != null) {
                var barrio = barrioRepository.findById(direccion.getIdbarrio().getId()).orElse(null);
                var ciudad = ciudadRepository.findById(barrio.getIdciudad().getId()).orElse(null);
                var departamento = departamentoRepository.findById(ciudad.getIddepartamento().getId()).orElse(null);

                DomicilioDto domicilioDto = new DomicilioDto();
                domicilioDto.setCalle(direccion.getCalle());
                domicilioDto.setNumero(direccion.getNumero());
                domicilioDto.setPiso(direccion.getPiso());
                domicilioDto.setDepto(direccion.getDepto());
                domicilioDto.setBarrio(barrio != null ? barrio.getBarrio() : null);
                domicilioDto.setCiudad(ciudad != null ? ciudad.getCiudad() : null);
                domicilioDto.setDepartamento(departamento != null ? departamento.getDepartamento() : null);

                return domicilioDto;
            }
        }
        return null;
    }
}
