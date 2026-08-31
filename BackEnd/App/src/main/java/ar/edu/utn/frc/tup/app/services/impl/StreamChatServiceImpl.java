package ar.edu.utn.frc.tup.app.services.impl;

import ar.edu.utn.frc.tup.app.entities.Profesionale;
import ar.edu.utn.frc.tup.app.entities.Usuario;
import ar.edu.utn.frc.tup.app.repositories.ProfesionalRepository;
import ar.edu.utn.frc.tup.app.repositories.UsuarioRepository;
import ar.edu.utn.frc.tup.app.services.StreamChatService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class StreamChatServiceImpl implements StreamChatService {

    @Value("${stream.chat.api.key}")
    private String apiKey;

    @Value("${stream.chat.api.secret}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final UsuarioRepository usuarioRepository;
    private final ProfesionalRepository profesionalRepository;

    @Override
    public String createUserToken(String userId) {
        try {
            log.info("Generando token para usuario: {}", userId);

            String token = Jwts.builder()
                    .claim("user_id", userId)
                    .signWith(SignatureAlgorithm.HS256, apiSecret.getBytes(StandardCharsets.UTF_8))
                    .compact();

            log.info("Token generado exitosamente para usuario: {}", userId);
            return token;

        } catch (Exception e) {
            log.error("Error al generar token para usuario: {}", userId, e);
            throw new RuntimeException("Error al crear token de usuario", e);
        }
    }

    @Override
    public void createOrUpdateUser(String userId, String nombre, String email, String imageUrl) {
        try {
            log.info("Creando/actualizando usuario en Stream: {}", userId);

            String url = String.format("https://chat.stream-io-api.com/users?api_key=%s", apiKey);

            Map<String, Object> user = new HashMap<>();
            user.put("id", userId);
            user.put("name", nombre);
            if (email != null && !email.isEmpty()) {
                user.put("email", email);
            }
            if (imageUrl != null && !imageUrl.isEmpty()) {
                user.put("image", imageUrl);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("users", Map.of(userId, user));

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("Usuario creado/actualizado en Stream: {} - Status: {}", userId, response.getStatusCode());

        } catch (Exception e) {
            log.error("Error al crear/actualizar usuario en Stream: {}", userId, e);
            throw new RuntimeException("Error al crear usuario en Stream Chat: " + e.getMessage(), e);
        }
    }

    @Override
    public String createChannel(String channelType, String channelId, String creatorId, Map<String, Object> additionalData) {
        try {
            log.info("Creando canal: {} de tipo: {}", channelId, channelType);

            String url = String.format("https://chat.stream-io-api.com/channels/%s/%s/query?api_key=%s",
                    channelType, channelId, apiKey);

            Map<String, Object> channelData = new HashMap<>();
            channelData.put("created_by_id", creatorId);
            channelData.put("frozen", false);
            channelData.put("disabled", false);
            channelData.put("invite_only", true);

            if (additionalData != null && !additionalData.isEmpty()) {
                Map<String, Object> mutableData = new HashMap<>(additionalData);
                mutableData.remove("member_count");
                mutableData.remove("max_members");
                mutableData.remove("type");
                channelData.putAll(mutableData);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("data", channelData);
            requestBody.put("state", true);
            requestBody.put("watch", false);

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, request, String.class);

            log.info("Canal creado exitosamente: {}", channelId);
            return channelId;

        } catch (Exception e) {
            log.error("Error al crear canal: {}", channelId, e);
            throw new RuntimeException("Error al crear canal en Stream Chat: " + e.getMessage(), e);
        }
    }

    @Override
    public void addMembersToChannel(String channelType, String channelId, List<String> userIds) {
        try {
            log.info("Agregando {} miembros al canal: {}", userIds.size(), channelId);

            String url = String.format("https://chat.stream-io-api.com/channels/%s/%s?api_key=%s",
                    channelType, channelId, apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("add_members", userIds);

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, request, String.class);

            log.info("Miembros agregados exitosamente al canal: {}", channelId);

        } catch (Exception e) {
            log.error("Error al agregar miembros al canal: {}", channelId, e);
            throw new RuntimeException("Error al agregar miembros al canal: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendMessage(String channelType, String channelId, String userId, String messageText) {
        try {
            log.info("Enviando mensaje al canal: {} por usuario: {}", channelId, userId);

            String url = String.format("https://chat.stream-io-api.com/channels/%s/%s/message?api_key=%s",
                    channelType, channelId, apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("text", messageText);
            message.put("user_id", userId);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, request, String.class);

            log.info("Mensaje enviado exitosamente al canal: {}", channelId);

        } catch (Exception e) {
            log.error("Error al enviar mensaje al canal: {}", channelId, e);
            throw new RuntimeException("Error al enviar mensaje: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Map<String, Object>> getChannelMessages(String channelType, String channelId, int limit) {
        try {
            log.info("Obteniendo mensajes del canal: {} (límite: {})", channelId, limit);

            String url = String.format("https://chat.stream-io-api.com/channels/%s/%s/query?api_key=%s",
                    channelType, channelId, apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> messagesConfig = new HashMap<>();
            messagesConfig.put("limit", limit);
            messagesConfig.put("offset", 0);
            requestBody.put("messages", messagesConfig);

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("messages")) {
                List<Map<String, Object>> messages = (List<Map<String, Object>>) response.getBody().get("messages");
                log.info("Mensajes obtenidos: {}", messages.size());
                return messages;
            }

            return new ArrayList<>();

        } catch (Exception e) {
            log.error("Error al obtener mensajes del canal: {}", channelId, e);
            throw new RuntimeException("Error al obtener mensajes: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Map<String, Object>> getUserChannels(String userId) {
        try {
            log.info("Obteniendo canales del usuario: {}", userId);

            String url = String.format("https://chat.stream-io-api.com/channels?api_key=%s", apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("filter_conditions", Map.of(
                    "members", Map.of("$in", List.of(userId))
            ));
            requestBody.put("sort", List.of(Map.of("last_message_at", -1)));
            requestBody.put("limit", 100);

            HttpHeaders headers = createServerAuthHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("channels")) {
                List<Map<String, Object>> channels = (List<Map<String, Object>>) response.getBody().get("channels");
                log.info("Canales obtenidos: {}", channels.size());

                return channels.stream()
                        .map(channel -> {
                            Map<String, Object> channelInfo = new HashMap<>();
                            channelInfo.put("channelId", channel.get("id"));
                            channelInfo.put("channelType", channel.get("type"));
                            channelInfo.put("members", channel.get("members"));
                            channelInfo.put("lastMessage", channel.get("last_message_at"));
                            return channelInfo;
                        })
                        .toList();
            }

            return new ArrayList<>();

        } catch (Exception e) {
            log.error("Error al obtener canales del usuario: {}", userId, e);
            throw new RuntimeException("Error al obtener conversaciones: " + e.getMessage(), e);
        }
    }


    @Override
    public String getApiKey() {
        return apiKey;
    }

    @Override
    public String getUserFullName(String userId) {
        try {
            Integer id = Integer.parseInt(userId);
            
            // Primero intentar buscar como usuario normal
            Optional<Usuario> optUsuario = usuarioRepository.findById(id);
            if (optUsuario.isPresent()) {
                Usuario u = optUsuario.get();
                String nombre = u.getIdauth().getName() != null ? u.getIdauth().getName() : "";
                String apellido = u.getIdauth().getLastname() != null ? u.getIdauth().getLastname() : "";
                String fullName = (nombre + " " + apellido).trim();
                log.info("Nombre encontrado para usuario {}: {}", userId, fullName);
                return fullName;
            }
            
            // Si no se encuentra como usuario, buscar como profesional
            Optional<Profesionale> optProfesional = profesionalRepository.findById(id);
            if (optProfesional.isPresent()) {
                Profesionale p = optProfesional.get();
                String nombre = p.getIdusuario().getIdauth().getName() != null ? p.getIdusuario().getIdauth().getName() : "";
                String apellido = p.getIdusuario().getIdauth().getLastname() != null ? p.getIdusuario().getIdauth().getLastname() : "";
                String fullName = (nombre + " " + apellido).trim();
                log.info("Nombre encontrado para profesional {}: {}", userId, fullName);
                return fullName;
            }
            
            log.warn("No se encontró usuario ni profesional con ID: {}", userId);
        } catch (Exception e) {
            log.warn("No se pudo obtener nombre completo para userId={}: {}", userId, e.getMessage());
        }
        return "";
    }

    private HttpHeaders createServerAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String serverToken = Jwts.builder()
                .claim("server", true)
                .signWith(SignatureAlgorithm.HS256, apiSecret.getBytes(StandardCharsets.UTF_8))
                .compact();

        headers.set("Authorization", serverToken);
        headers.set("Stream-Auth-Type", "jwt");

        return headers;
    }
}
