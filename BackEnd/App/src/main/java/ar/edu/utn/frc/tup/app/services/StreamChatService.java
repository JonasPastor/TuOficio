package ar.edu.utn.frc.tup.app.services;

import java.util.List;
import java.util.Map;

public interface StreamChatService {
    String createUserToken(String userId);
    void createOrUpdateUser(String userId, String nombre, String email, String imageUrl);
    String createChannel(String channelType, String channelId, String creatorId, Map<String, Object> additionalData);
    void addMembersToChannel(String channelType, String channelId, List<String> userIds);
    void sendMessage(String channelType, String channelId, String userId, String message);
    List<Map<String, Object>> getChannelMessages(String channelType, String channelId, int limit);
    List<Map<String, Object>> getUserChannels(String userId);
    String getApiKey();
    String getUserFullName(String userId);
}
