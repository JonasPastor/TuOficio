package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.dtos.DomicilioDto;
import ar.edu.utn.frc.tup.app.dtos.request.perfil.ModificarCliente;
import ar.edu.utn.frc.tup.app.dtos.request.perfil.ModificarProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.UsuariosRegistradosDto;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilCliente;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.PerfilProfesional;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.FotoGaleriaDto;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica.ProfesionalMetrica;
import ar.edu.utn.frc.tup.app.dtos.response.perfil.metrica.UsuarioMetrica;
import ar.edu.utn.frc.tup.app.entities.*;
import ar.edu.utn.frc.tup.app.repositories.*;
import ar.edu.utn.frc.tup.app.services.PerfilService;
import ar.edu.utn.frc.tup.app.services.ReseniaService;
import ar.edu.utn.frc.tup.app.services.TrabajoService;
import ar.edu.utn.frc.tup.app.auth.services.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PerfilServiceImpl implements PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final AuthRepository authRepository;
    private final DireccionRepository direccionRepository;
    private final CiudadRepository ciudadRepository;
    private final DepartamentoRepository departamentoRepository;
    private final BarrioRepository barrioRepository;
    private final ProfesionalRepository professionelleRepository;
    private final MontoRepository montoRepository;
    private final DisponibilidadRepository disponibilidadRepository;
    private final EspecialidadRepository especialidadRepository;
    private final OficioRepository oficioRepository;

    private final ReseniaService reseniaService;
    private final ReseniaRepository reseniaRepository;
    private final TrabajoService trabajoService;
    private final JwtService jwtService;
    private final FotoGaleriaRepository fotoGaleriaRepository;

    @Override
    public PerfilCliente getPerfilCliente(Integer idCliente) {
        Usuario usuario = usuarioRepository.findById(idCliente).orElse(null);
        if(usuario != null){
            Direccione direccion = usuario.getIddireccion();
            DomicilioDto domicilioDto = new DomicilioDto();
            if (direccion != null) {
                var barrio = barrioRepository.findById(direccion.getIdbarrio().getId()).orElse(null);
                var ciudad = ciudadRepository.findById(barrio.getIdciudad().getId()).orElse(null);
                var departamento = departamentoRepository.findById(ciudad.getIddepartamento().getId()).orElse(null);

                domicilioDto.setId(direccion.getId()); // Agregar el ID de la direcci\u00f3n
                domicilioDto.setCalle(direccion.getCalle());
                domicilioDto.setNumero(direccion.getNumero());
                domicilioDto.setPiso(direccion.getPiso());
                domicilioDto.setDepto(direccion.getDepto());
                domicilioDto.setBarrio(barrio != null ? barrio.getBarrio() : null);
                domicilioDto.setCiudad(ciudad != null ? ciudad.getCiudad() : null);
                domicilioDto.setDepartamento(departamento != null ? departamento.getDepartamento() : null);
            }
            var tipoDocumento = usuario.getIdtipodoc() != null ? usuario.getIdtipodoc().getTipo() : null;

            PerfilCliente perfil = PerfilCliente.builder()
                    .avatar(usuario.getIdauth().getAvatar())
                    .name(usuario.getIdauth().getName())
                    .lastName(usuario.getIdauth().getLastname())
                    .telefono(usuario.getTelefono())
                    .tipoDocumento(tipoDocumento)
                    .documento(usuario.getDocumento())
                    .nacimiento(usuario.getNacimiento())
                    .email(usuario.getIdauth().getUsername())
                    .domicilio(domicilioDto)
                    .strikes(usuario.getStrike())
                    .estado(usuario.getIdauth().getActive())
                    .build();
            return perfil;
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }

    @Override
    public PerfilCliente updatePerfilCliente(ModificarCliente cliente, String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.getUsernameFromToken(token);

        Auth auth = authRepository.findByMail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con el email: " + email));

        auth.setName(cliente.getName());
        auth.setLastname(cliente.getLastName());
        authRepository.save(auth);

        Usuario usuario = usuarioRepository.findByIdauth(auth)
                .orElseThrow(() -> new RuntimeException("No se encontró un usuario asociado a la autenticación"));

        if (cliente.getAdress() != null && cliente.getAdress().getId() != null) {
            try {
                Direccione direccion = direccionRepository.findById(cliente.getAdress().getId())
                        .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

                if (cliente.getAdress().getIdbarrio() != null) {
                    direccion.setIdbarrio(cliente.getAdress().getIdbarrio());
                }
                if (cliente.getAdress().getCalle() != null) {
                    direccion.setCalle(cliente.getAdress().getCalle());
                }
                if (cliente.getAdress().getNumero() != null) {
                    direccion.setNumero(cliente.getAdress().getNumero());
                }
                direccion.setPiso(cliente.getAdress().getPiso());
                direccion.setDepto(cliente.getAdress().getDepto());
                direccion.setObservaciones(cliente.getAdress().getObservaciones());

                direccionRepository.save(direccion);
            } catch (Exception e) {
                System.err.println("Error al actualizar dirección: " + e.getMessage());
            }
        }

        if (cliente.getPhone() != null && !cliente.getPhone().isEmpty()) {
            usuario.setTelefono(cliente.getPhone());
        }

        usuarioRepository.save(usuario);

        return PerfilCliente.builder()
                .name(auth.getName())
                .lastName(auth.getLastname())
                .email(auth.getMail())
                .telefono(usuario.getTelefono())
                .build();
    }

    @Override
    public PerfilProfesional getPerfilProfesional(Integer idProfesional) {
        Profesionale profesional = professionelleRepository.findById(idProfesional).orElse(null);
        if(profesional == null){
            throw new RuntimeException("Profesional no encontrado");
        }

        Monto monto = montoRepository.findByIdprofesional_Id(profesional.getId()).orElse(null);

        String rangoPrecio = calcularRangoPrecio(monto, profesional);
        List<String> especialidadesList = obtenerEspecialidades(profesional);

        Double puntuacionPromedio = reseniaRepository.getPromedioPuntuacionByProfesional(profesional.getId());
        Long cantidadResenias = reseniaRepository.countReseniasByProfesional(profesional.getId());

        List<FotoGaleriaDto> fotosGaleria = fotoGaleriaRepository.findByProfesionalIdOrderByOrdenAsc(profesional.getId())
                .stream()
                .map(foto -> FotoGaleriaDto.builder()
                        .id(foto.getId())
                        .urlFoto(foto.getUrlFoto())
                        .descripcion(foto.getDescripcion())
                        .fechaSubida(foto.getFechaSubida())
                        .orden(foto.getOrden())
                        .build())
                .toList();

        return PerfilProfesional.builder()
                .idProfesional(profesional.getId())
                .nombre(profesional.getIdusuario().getIdauth().getName())
                .apellido(profesional.getIdusuario().getIdauth().getLastname())
                .email(profesional.getIdusuario().getIdauth().getMail())
                .avatar(profesional.getIdusuario().getIdauth().getAvatar())
                .oficio(profesional.getIdoficio().getOficio())
                .telefono(profesional.getIdusuario().getTelefono())
                .rangoPrecio(rangoPrecio)
                .especialidades(especialidadesList)
                .puntuacionPromedio(puntuacionPromedio != null ? Math.round(puntuacionPromedio * 10.0) / 10.0 : null)
                .cantidadResenias(cantidadResenias)
                .fotosGaleria(fotosGaleria)
                .build();
    }

    @Override
    public PerfilProfesional updatePerfilProfesional(ModificarProfesional request) {
        Profesionale profesional = professionelleRepository.findById(request.getIdProfesional())
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        if (request.getIdOficio() != null) {
            Oficio oficio = oficioRepository.findById(request.getIdOficio())
                    .orElseThrow(() -> new RuntimeException("Oficio no encontrado"));
            profesional.setIdoficio(oficio);
        }

        if (request.getFechaDesde() != null) {
            profesional.setFechadesde(request.getFechaDesde());
        }
        if (request.getFechaHasta() != null) {
            profesional.setFechahasta(request.getFechaHasta());
        }

        if (request.getPrecioMin() != null) {
            profesional.setPrecioMin(request.getPrecioMin());
        }
        if (request.getPrecioMax() != null) {
            profesional.setPrecioMax(request.getPrecioMax());
        }

        professionelleRepository.save(profesional);

        if (request.getEspecialidades() != null) {
            if (profesional.getEspecialidades() != null && !profesional.getEspecialidades().isEmpty()) {
                especialidadRepository.deleteAll(profesional.getEspecialidades());
            }

            final Profesionale profesionalFinal = profesional;
            request.getEspecialidades().forEach(especialidadNombre -> {
                Especialidad especialidad = Especialidad.builder()
                        .especialidad(especialidadNombre)
                        .idprofesional(profesionalFinal)
                        .build();
                especialidadRepository.save(especialidad);
            });
        }

        profesional = professionelleRepository.findById(request.getIdProfesional())
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        return mapToPerfilProfesional(profesional);
    }

    @Override
    public void updateAvatar(Integer idAuth, String avatarUrl) {
        Auth auth = authRepository.findById(idAuth)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        auth.setAvatar(avatarUrl);
        authRepository.save(auth);
    }

    @Override
    public void updateAvatarByUsuarioId(Integer idUsuario, String avatarUrl) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Auth auth = usuario.getIdauth();
        auth.setAvatar(avatarUrl);
        authRepository.save(auth);
    }

    @Override
    public String getAvatar(Integer idAuth) {
        Auth auth = authRepository.findById(idAuth)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return auth.getAvatar();
    }

    @Override
    public String getAvatarByUsuarioId(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return usuario.getIdauth().getAvatar();
    }

    @Override
    @Transactional
    public List<PerfilProfesional> getProfesionalesByOficio(String oficio) {
        try {
            List<Profesionale> profesionales = professionelleRepository.findByOficioSimple(oficio);

            profesionales.forEach(p -> {
                if (p.getEspecialidades() != null) {
                    p.getEspecialidades().size();
                }
            });

            return profesionales.stream()
                    .map(this::mapToPerfilProfesional)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener profesionales por oficio: " + e.getMessage(), e);
        }
    }

    @Override
    public void agregarStrike(String email, String motivo) {
        Auth auth = authRepository.findByMail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
        
        Usuario usuario = usuarioRepository.findByIdauth(auth)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Integer strikesActuales = usuario.getStrike() != null ? usuario.getStrike() : 0;
        usuario.setStrike(strikesActuales + 1);

        if (usuario.getStrike() >= 3) {
            usuario.getIdauth().setActive(false);
        }
        usuarioRepository.save(usuario);
    }

    @Override
    public List<UsuarioMetrica> getUsuariosMetrica(Integer limit, Integer offset) {
        List<Usuario> usuarios = usuarioRepository.findAll();

        List<UsuarioMetrica> usuarioMetricas = new ArrayList<>();

        for (Usuario usuario : usuarios) {
            UsuarioMetrica metrica = UsuarioMetrica.builder()
                    .nombre(usuario.getIdauth().getName() + " " + usuario.getIdauth().getLastname())
                    .email(usuario.getIdauth().getMail())
                    .strikes(usuario.getStrike() != null ? usuario.getStrike() : 0)
                    .estado(usuario.getIdauth().getActive())
                    .build();
            usuarioMetricas.add(metrica);
        }

        // Aplicar offset
        int startIndex = (offset != null && offset >= 0) ? offset : 0;
        if (startIndex >= usuarioMetricas.size()) {
            return new ArrayList<>();
        }

        // Aplicar limit
        int endIndex = usuarioMetricas.size();
        if (limit != null && limit > 0) {
            endIndex = Math.min(startIndex + limit, usuarioMetricas.size());
        }

        return usuarioMetricas.subList(startIndex, endIndex);
    }

    @Override
    public List<ProfesionalMetrica> getProfesionalesMetrica(Integer limit, Integer offset) {
        List<Profesionale> profesionales = professionelleRepository.findAll();

        List<ProfesionalMetrica> profesionalMetricas = new ArrayList<>();

        for(Profesionale profesional : profesionales) {
            String calificacionTexto = "No tiene reseñas";
            Integer serviciosCompletados = 0;

            try {
                Integer calificacionNumerica = reseniaService.getPromedioProfesional(profesional.getId()).getPuntuacion().intValue();

                calificacionTexto = calificacionNumerica.toString();

                serviciosCompletados = trabajoService.obtenerTrabajosPorProfesionalyEstado(profesional.getId(),"FINALIZADO").size();

            } catch (Exception e) {
                System.err.println("Error al obtener promedio o trabajos para el profesional " + profesional.getId() + ": " + e.getMessage());
            }

            ProfesionalMetrica metrica = ProfesionalMetrica.builder()
                    .nombre(profesional.getIdusuario().getIdauth().getName() + " " +
                            profesional.getIdusuario().getIdauth().getLastname())
                    .oficio(profesional.getIdoficio().getOficio())
                    .calificacion(calificacionTexto)
                    .serviciosCompletados(serviciosCompletados)
                    .build();
            profesionalMetricas.add(metrica);
        }

        // Aplicar offset
        int startIndex = (offset != null && offset >= 0) ? offset : 0;
        if (startIndex >= profesionalMetricas.size()) {
            return new ArrayList<>();
        }

        // Aplicar limit
        int endIndex = profesionalMetricas.size();
        if (limit != null && limit > 0) {
            endIndex = Math.min(startIndex + limit, profesionalMetricas.size());
        }

        return profesionalMetricas.subList(startIndex, endIndex);
    }

    @Override
    public UsuariosRegistradosDto getUsuariosRegistrados() {
        long totalUsuarios = usuarioRepository.count();
        long totalProfesionales = professionelleRepository.count();

        UsuariosRegistradosDto dto = new UsuariosRegistradosDto();
        dto.setCantClientes((int) totalUsuarios);
        dto.setCantProfesionales((int) totalProfesionales);

        return dto;
    }

    private PerfilProfesional mapToPerfilProfesional(Profesionale profesional) {
        Monto monto = montoRepository.findByIdprofesional_Id(profesional.getId()).orElse(null);

        String rangoPrecio = calcularRangoPrecio(monto, profesional);
        List<String> especialidadesList = obtenerEspecialidades(profesional);

        Double puntuacionPromedio = reseniaRepository.getPromedioPuntuacionByProfesional(profesional.getId());
        Long cantidadResenias = reseniaRepository.countReseniasByProfesional(profesional.getId());
        
        // Calcular servicios completados
        Integer serviciosCompletados = 0;
        try {
            serviciosCompletados = trabajoService.obtenerTrabajosPorProfesionalyEstado(profesional.getId(), "FINALIZADO").size();
        } catch (Exception e) {
            System.err.println("Error al obtener trabajos finalizados para el profesional " + profesional.getId() + ": " + e.getMessage());
        }

        List<FotoGaleriaDto> fotosGaleria = fotoGaleriaRepository.findByProfesionalIdOrderByOrdenAsc(profesional.getId())
                .stream()
                .map(foto -> FotoGaleriaDto.builder()
                        .id(foto.getId())
                        .urlFoto(foto.getUrlFoto())
                        .descripcion(foto.getDescripcion())
                        .fechaSubida(foto.getFechaSubida())
                        .orden(foto.getOrden())
                        .build())
                .toList();

        return PerfilProfesional.builder()
                .idProfesional(profesional.getId())
                .nombre(profesional.getIdusuario().getIdauth().getName())
                .apellido(profesional.getIdusuario().getIdauth().getLastname())
                .email(profesional.getIdusuario().getIdauth().getMail())
                .avatar(profesional.getIdusuario().getIdauth().getAvatar())
                .oficio(profesional.getIdoficio().getOficio())
                .telefono(profesional.getIdusuario().getTelefono())
                .rangoPrecio(rangoPrecio)
                .especialidades(especialidadesList)
                .puntuacionPromedio(puntuacionPromedio != null ? Math.round(puntuacionPromedio * 10.0) / 10.0 : null)
                .cantidadResenias(cantidadResenias)
                .serviciosCompletados(serviciosCompletados)
                .fotosGaleria(fotosGaleria)
                .build();
    }

    private String calcularRangoPrecio(Monto monto, Profesionale profesional) {
        if (monto != null && monto.getPreciomin() != null && monto.getPreciomax() != null) {
            return monto.getPreciomin() + " - " + monto.getPreciomax();
        } else if (profesional.getPrecioMin() != null && profesional.getPrecioMax() != null) {
            return profesional.getPrecioMin() + " - " + profesional.getPrecioMax();
        }
        return "No especificado";
    }

    private List<String> obtenerEspecialidades(Profesionale profesional) {
        if (profesional.getEspecialidades() != null) {
            try {
                return profesional.getEspecialidades().stream()
                        .map(Especialidad::getEspecialidad)
                        .toList();
            } catch (Exception e) {
                return List.of();
            }
        }
        return List.of();
    }

    @Override
    public List<PerfilCliente> getClientesByNombre(String nombre) {
        List<Usuario> usuarios = usuarioRepository.findByNombreCompleto(nombre);

        List<PerfilCliente> perfiles = new ArrayList<>();
        for (Usuario usuario : usuarios) {
            try {
                Direccione direccion = usuario.getIddireccion();
                DomicilioDto domicilioDto = new DomicilioDto();
                if (direccion != null) {
                    var barrio = barrioRepository.findById(direccion.getIdbarrio().getId()).orElse(null);
                    var ciudad = barrio != null ? ciudadRepository.findById(barrio.getIdciudad().getId()).orElse(null) : null;
                    var departamento = ciudad != null ? departamentoRepository.findById(ciudad.getIddepartamento().getId()).orElse(null) : null;

                    domicilioDto.setCalle(direccion.getCalle());
                    domicilioDto.setNumero(direccion.getNumero());
                    domicilioDto.setPiso(direccion.getPiso());
                    domicilioDto.setDepto(direccion.getDepto());
                    domicilioDto.setBarrio(barrio != null ? barrio.getBarrio() : null);
                    domicilioDto.setCiudad(ciudad != null ? ciudad.getCiudad() : null);
                    domicilioDto.setDepartamento(departamento != null ? departamento.getDepartamento() : null);
                }
                var tipoDocumento = usuario.getIdtipodoc() != null ? usuario.getIdtipodoc().getTipo() : null;

                PerfilCliente perfil = PerfilCliente.builder()
                        .avatar(usuario.getIdauth().getAvatar())
                        .name(usuario.getIdauth().getName())
                        .lastName(usuario.getIdauth().getLastname())
                        .telefono(usuario.getTelefono())
                        .tipoDocumento(tipoDocumento)
                        .documento(usuario.getDocumento())
                        .nacimiento(usuario.getNacimiento())
                        .email(usuario.getIdauth().getUsername())
                        .domicilio(domicilioDto)
                        .strikes(usuario.getStrike())
                        .estado(usuario.getIdauth().getActive())
                        .build();
                perfiles.add(perfil);
            } catch (Exception e) {
                System.err.println("Error al mapear cliente: " + e.getMessage());
            }
        }
        return perfiles;
    }

    @Override
    @Transactional
    public List<PerfilProfesional> getProfesionalesByNombre(String nombre) {
        List<Profesionale> profesionales = professionelleRepository.findByNombreCompleto(nombre);

        // Forzar la carga de especialidades dentro de la transacción
        profesionales.forEach(p -> {
            if (p.getEspecialidades() != null) {
                p.getEspecialidades().size(); // Esto fuerza la carga lazy
            }
        });

        return profesionales.stream()
                .map(this::mapToPerfilProfesional)
                .toList();
    }
}
