import { Observable } from 'rxjs';
import {
  ChatInitData,
  ChatChannel,
  ChatMessage,
  CreateChannelRequest,
  SendMessageRequest,
  Professional,
  ConversationWithProfessional,
  ChatUser,
} from './chat.model';

/**
 * Repositorio abstracto para operaciones de Chat
 * Define el contrato que debe implementar la capa de datos
 */
export abstract class ChatRepository {
  /**
   * Inicializar chat para un usuario
   */
  abstract initializeChat(userId: string): Observable<ChatInitData>;

  /**
   * Crear o actualizar un usuario en Stream Chat
   */
  abstract createOrUpdateUser(user: ChatUser): Observable<{ status: string; userId: string }>;

  /**
   * Crear un nuevo canal de chat
   */
  abstract createChannel(request: CreateChannelRequest): Observable<{ status: string; channelId: string }>;

  /**
   * Agregar miembros a un canal existente
   */
  abstract addMembersToChannel(
    channelType: string,
    channelId: string,
    userIds: string[]
  ): Observable<{ status: string; message: string }>;

  /**
   * Enviar un mensaje a un canal
   */
  abstract sendMessage(request: SendMessageRequest): Observable<{ status: string; message: string }>;

  /**
   * Obtener mensajes de un canal
   */
  abstract getChannelMessages(
    channelType: string,
    channelId: string,
    limit?: number
  ): Observable<ChatMessage[]>;

  /**
   * Obtener conversaciones/canales de un usuario
   */
  abstract getUserConversations(userId: string): Observable<ChatChannel[]>;

  /**
   * Obtener profesionales disponibles
   */
  abstract getAvailableProfessionals(): Observable<Professional[]>;

  /**
   * Crear conversación con un profesional
   */
  abstract createConversationWithProfessional(
    request: ConversationWithProfessional
  ): Observable<ChatChannel>;

  /**
   * Generar token de autenticación para usuario
   */
  abstract generateUserToken(userId: string): Observable<{ userId: string; token: string }>;
}
