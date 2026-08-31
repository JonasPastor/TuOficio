package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.services.StreamChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat", description = "Endpoints para gestión de chat en tiempo real")
public class ChatController {

    private final StreamChatService streamChatService;

    @PostMapping("/token")
    @Operation(summary = "Generar token de autenticación para usuario")
    public ResponseEntity<Map<String, String>> generateToken(@RequestParam String userId) {
        log.info("Generando token para usuario: {}", userId);
        String token = streamChatService.createUserToken(userId);
        return ResponseEntity.ok(Map.of("userId", userId, "token", token));
    }

    @PostMapping("/users")
    @Operation(summary = "Crear o actualizar usuario en Stream Chat")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody Map<String, String> userData) {
        String userId = userData.get("userId");
        String nombre = userData.get("nombre");
        String email = userData.get("email");
        String imageUrl = userData.get("imageUrl");

        streamChatService.createOrUpdateUser(userId, nombre, email, imageUrl);
        return ResponseEntity.ok(Map.of("status", "success", "userId", userId));
    }

    @PostMapping("/channels")
    @Operation(summary = "Crear canal de chat")
    public ResponseEntity<Map<String, String>> createChannel(@RequestBody Map<String, Object> channelData) {
        String channelType = (String) channelData.get("channelType");
        String channelId = (String) channelData.get("channelId");
        String creatorId = (String) channelData.get("creatorId");

        streamChatService.createChannel(channelType, channelId, creatorId, channelData);
        return ResponseEntity.ok(Map.of("status", "success", "channelId", channelId));
    }

    @PostMapping("/channels/members")
    @Operation(summary = "Agregar miembros a canal")
    public ResponseEntity<Map<String, String>> addMembers(@RequestBody Map<String, Object> request) {
        String channelType = (String) request.get("channelType");
        String channelId = (String) request.get("channelId");
        List<String> userIds = (List<String>) request.get("userIds");

        streamChatService.addMembersToChannel(channelType, channelId, userIds);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Miembros agregados"));
    }

    @PostMapping("/messages")
    @Operation(summary = "Enviar mensaje a canal")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody Map<String, String> messageData) {
        String channelType = messageData.get("channelType");
        String channelId = messageData.get("channelId");
        String userId = messageData.get("userId");
        String message = messageData.get("message");

        streamChatService.sendMessage(channelType, channelId, userId, message);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Mensaje enviado"));
    }

    @GetMapping("/channels/{channelType}/{channelId}/messages")
    @Operation(summary = "Obtener mensajes de un canal")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable String channelType,
            @PathVariable String channelId,
            @RequestParam(defaultValue = "25") int limit) {

        log.info("Obteniendo mensajes del canal: {}/{}", channelType, channelId);
        List<Map<String, Object>> messages = streamChatService.getChannelMessages(channelType, channelId, limit);

        return ResponseEntity.ok(Map.of(
                "channelId", channelId,
                "channelType", channelType,
                "messages", messages,
                "total", messages.size()
        ));
    }

    @GetMapping("/init")
    @Operation(summary = "Inicializar datos de chat para usuario")
    public ResponseEntity<Map<String, Object>> initializeChat(@RequestParam String userId) {
        log.info("Inicializando chat para usuario: {}", userId);

        String token = streamChatService.createUserToken(userId);
        String fullName = streamChatService.getUserFullName(userId);
        
        log.info("Usuario {} inicializado con nombre: '{}'", userId, fullName);
        
        // ✅ Crear/actualizar el usuario en Stream Chat con su nombre correcto
        if (!fullName.isEmpty()) {
            streamChatService.createOrUpdateUser(userId, fullName, null, null);
        }

        return ResponseEntity.ok(Map.of(
                "apiKey", streamChatService.getApiKey(),
                "userId", userId,
                "token", token,
                "fullName", fullName
        ));
    }

    @GetMapping("/user/{userId}/conversations")
    @Operation(summary = "Obtener conversaciones de un usuario")
    public ResponseEntity<List<Map<String, Object>>> getUserConversations(@PathVariable String userId) {
        log.info("Obteniendo conversaciones para usuario: {}", userId);

        List<Map<String, Object>> conversations = streamChatService.getUserChannels(userId);

        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/conversations/create")
    @Operation(summary = "Crear conversación privada entre dos usuarios")
    public ResponseEntity<Map<String, Object>> createConversation(@RequestBody Map<String, Object> request) {
        String userId1 = (String) request.get("userId1");
        String userId2 = (String) request.get("userId2");

        if (userId1.equals(userId2)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "No puedes crear una conversación contigo mismo"
            ));
        }

        log.info("Creando conversación privada entre {} y {}", userId1, userId2);

        String channelId = "dm-" +
                Math.min(Integer.parseInt(userId1), Integer.parseInt(userId2)) +
                "-" +
                Math.max(Integer.parseInt(userId1), Integer.parseInt(userId2));

        List<String> members = List.of(userId1, userId2);

        streamChatService.createChannel("messaging", channelId, userId1, Map.of(
                "name", "Chat Privado",
                "members", members,
                "member_count", 2,
                "max_members", 2
        ));

        streamChatService.addMembersToChannel("messaging", channelId, members);

        return ResponseEntity.ok(Map.of(
                "channelId", channelId,
                "channelType", "messaging",
                "members", members,
                "status", "success"
        ));
    }

    @GetMapping("/professionals/available")
    @Operation(summary = "Obtener lista de profesionales disponibles")
    public ResponseEntity<List<Map<String, Object>>> getAvailableProfessionals() {
        List<Map<String, Object>> professionals = List.of(
                Map.of("id", "prof-1", "name", "Dr. Juan Pérez", "specialty", "Psicología"),
                Map.of("id", "prof-2", "name", "Dra. María López", "specialty", "Nutrición"),
                Map.of("id", "prof-3", "name", "Lic. Carlos Ruiz", "specialty", "Entrenamiento")
        );

        return ResponseEntity.ok(professionals);
    }

    @PostMapping("/conversations/with-professional")
    @Operation(summary = "Crear/obtener conversación entre usuario y profesional")
    public ResponseEntity<Map<String, Object>> createConversationWithProfessional(
            @RequestBody Map<String, String> request) {

        String userId = request.get("userId");
        String professionalId = request.get("professionalId");

        log.info("Iniciando conversación entre usuario {} y profesional {}", userId, professionalId);

        // ✅ Asegurarse de que ambos usuarios existan en Stream con sus nombres correctos
        String userFullName = streamChatService.getUserFullName(userId);
        String professionalFullName = streamChatService.getUserFullName(professionalId);
        
        log.info("Nombres obtenidos - Usuario: '{}', Profesional: '{}'", userFullName, professionalFullName);
        
        // Crear/actualizar ambos usuarios en Stream Chat con sus nombres correctos
        if (!userFullName.isEmpty()) {
            streamChatService.createOrUpdateUser(userId, userFullName, null, null);
        }
        if (!professionalFullName.isEmpty()) {
            streamChatService.createOrUpdateUser(professionalId, professionalFullName, null, null);
        }

        String channelId = "support-" +
                Math.min(Integer.parseInt(userId), Integer.parseInt(professionalId)) +
                "-" +
                Math.max(Integer.parseInt(userId), Integer.parseInt(professionalId));

        List<String> members = List.of(userId, professionalId);

        try {
            streamChatService.createChannel("messaging", channelId, userId, Map.of(
                    "name", "Consulta Profesional",
                    "members", members,
                    "invite_only", true
            ));

            streamChatService.addMembersToChannel("messaging", channelId, members);
        } catch (Exception e) {
            log.info("Canal existente reutilizado: {}", channelId);
        }

        return ResponseEntity.ok(Map.of(
                "channelId", channelId,
                "channelType", "messaging",
                "members", members,
                "status", "success"
        ));
    }

}
