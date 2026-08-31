package ar.edu.utn.frc.tup.app.services;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import org.springframework.stereotype.Service;

@Service
public interface DomicilioService {
    DomicilioDto getDomicilioUsuario(int idUsuario);
}
