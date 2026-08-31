package ar.edu.utn.frc.tup.app.controllers;

import ar.edu.utn.frc.tup.app.services.StreamChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestStreamController {

    private final StreamChatService streamChatService;

    @GetMapping("/stream")
    public ResponseEntity<String> testStream() {
        try {
            streamChatService.createOrUpdateUser(
                    "test-1",
                    "Usuario Test",
                    "test@example.com",
                    null
            );
            return ResponseEntity.ok("Stream Chat funciona correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error: " + e.getMessage());
        }
    }
}
