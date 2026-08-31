package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.entities.TiposDocumento;
import ar.edu.utn.frc.tup.app.repositories.TipoDocumentoRepository;
import ar.edu.utn.frc.tup.app.repositories.UsuarioRepository;
import ar.edu.utn.frc.tup.app.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final TipoDocumentoRepository tipoDocumentoRepository;

    @Override
    public List<TiposDocumento> getTiposDocumento() {
        return tipoDocumentoRepository.findAll();
    }
}
