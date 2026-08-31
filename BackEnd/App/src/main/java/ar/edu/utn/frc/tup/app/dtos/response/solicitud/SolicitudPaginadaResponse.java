package ar.edu.utn.frc.tup.app.dtos.response.solicitud;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudPaginadaResponse {
    private List<Map<String, Object>> solicitudes;
    private int paginaActual;
    private int tamanioPagina;
    private long totalElementos;
    private int totalPaginas;
    private boolean tieneSiguiente;
    private boolean tieneAnterior;
}
