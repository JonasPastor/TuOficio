import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChatRepository } from '../../domain/chat/chat.repository';
import {
  ChatInitData,
  ChatChannel,
  ChatMessage,
  CreateChannelRequest,
  SendMessageRequest,
  Professional,
  ConversationWithProfessional,
  ChatUser,
} from '../../domain/chat/chat.model';
import { environment } from '../../../environments/environment';

/**
 * Implementación HTTP del repositorio de Chat
 * Se comunica con el backend para operaciones de Stream Chat
 */
@Injectable()
export class ChatHttpRepository extends ChatRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.streamChat.apiUrl;

  override initializeChat(userId: string): Observable<ChatInitData> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<ChatInitData>(`${this.apiUrl}/init`, { params });
  }

  override createOrUpdateUser(
    user: ChatUser
  ): Observable<{ status: string; userId: string }> {
    return this.http.post<{ status: string; userId: string }>(
      `${this.apiUrl}/users`,
      {
        userId: user.id,
        nombre: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      }
    );
  }

  override createChannel(
    request: CreateChannelRequest
  ): Observable<{ status: string; channelId: string }> {
    return this.http.post<{ status: string; channelId: string }>(
      `${this.apiUrl}/channels`,
      {
        channelType: request.channelType,
        channelId: request.channelId,
        creatorId: request.creatorId,
        name: request.name,
        members: request.members,
        ...request.metadata,
      }
    );
  }

  override addMembersToChannel(
    channelType: string,
    channelId: string,
    userIds: string[]
  ): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${this.apiUrl}/channels/members`,
      {
        channelType,
        channelId,
        userIds,
      }
    );
  }

  override sendMessage(
    request: SendMessageRequest
  ): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${this.apiUrl}/messages`,
      {
        channelType: request.channelType,
        channelId: request.channelId,
        userId: request.userId,
        message: request.text,
      }
    );
  }

  override getChannelMessages(
    channelType: string,
    channelId: string,
    limit: number = 25
  ): Observable<ChatMessage[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http
      .get<{ messages: any[] }>(`${this.apiUrl}/channels/${channelType}/${channelId}/messages`, {
        params,
      })
      .pipe(
        map((response) =>
          response.messages.map((msg) => ({
            id: msg.id,
            text: msg.text,
            userId: msg.user.id,
            userName: msg.user.name,
            createdAt: new Date(msg.created_at),
            attachments: msg.attachments,
          }))
        )
      );
  }

  override getUserConversations(userId: string): Observable<ChatChannel[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/user/${userId}/conversations`)
      .pipe(
        map((conversations) =>
          conversations.map((conv) => ({
            id: conv.channelId,
            type: conv.channelType,
            name: conv.name,
            members: conv.members || [],
            createdBy: conv.createdBy || '',
            createdAt: new Date(conv.createdAt || Date.now()),
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount || 0,
            metadata: conv.metadata,
          }))
        )
      );
  }

  override getAvailableProfessionals(): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${this.apiUrl}/professionals/available`);
  }

  override createConversationWithProfessional(
    request: ConversationWithProfessional
  ): Observable<ChatChannel> {
    return this.http
      .post<{
        channelId: string;
        channelType: string;
        members: string[];
        status: string;
      }>(`${this.apiUrl}/conversations/with-professional`, {
        userId: request.userId,
        professionalId: request.professionalId,
      })
      .pipe(
        map((response) => ({
          id: response.channelId,
          type: response.channelType as 'messaging' | 'team',
          members: response.members,
          createdBy: request.userId,
          createdAt: new Date(),
          name: 'Consulta Profesional',
        }))
      );
  }

  override generateUserToken(userId: string): Observable<{ userId: string; token: string }> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<{ userId: string; token: string }>(
      `${this.apiUrl}/token`,
      {},
      { params }
    );
  }
}
