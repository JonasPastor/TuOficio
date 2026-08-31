import { Injectable, inject } from '@angular/core';
import { StreamChat, Channel, ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { InitializeChatUseCase } from '../../../domain/chat/use-cases/initialize-chat.usecase';

/**
 * Servicio para manejar la integración con Stream Chat SDK
 * Maneja la conexión, estado y operaciones en tiempo real
 */
@Injectable({ providedIn: 'root' })
export class StreamChatService {
  private readonly initChatUseCase = inject(InitializeChatUseCase);
  
  private chatClient: StreamChat | null = null;
  private currentChannel: Channel | null = null;
  
  // Estado reactivo
  private readonly isConnectedSubject = new BehaviorSubject<boolean>(false);
  private readonly currentUserIdSubject = new BehaviorSubject<string | null>(null);
  private readonly currentChannelSubject = new BehaviorSubject<Channel | null>(null);

  readonly isConnected$ = this.isConnectedSubject.asObservable();
  readonly currentUserId$ = this.currentUserIdSubject.asObservable();
  readonly currentChannel$ = this.currentChannelSubject.asObservable();

  /**
   * Inicializar y conectar usuario a Stream Chat
   */
  connectUser(userId: string): Observable<void> {
    return from(this._connectUser(userId)).pipe(
      tap(() => {
        this.isConnectedSubject.next(true);
        this.currentUserIdSubject.next(userId);
      }),
      catchError((error) => {
        console.error('Error conectando usuario:', error);
        this.isConnectedSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  private async _connectUser(userId: string): Promise<void> {
    try {
      // Obtener datos de inicialización del backend
      const initData = await this.initChatUseCase.execute(userId).toPromise();
      
      if (!initData) {
        throw new Error('No se pudieron obtener los datos de inicialización');
      }

      // Crear instancia de Stream Chat
      this.chatClient = StreamChat.getInstance(initData.apiKey);

      // Conectar usuario
      await this.chatClient.connectUser(
        {
          id: userId,
          name: `Usuario ${userId}`,
        },
        initData.token
      );

      console.log('✅ Usuario conectado a Stream Chat:', userId);
    } catch (error) {
      console.error('❌ Error en _connectUser:', error);
      throw error;
    }
  }

  /**
   * Desconectar usuario
   */
  async disconnectUser(): Promise<void> {
    if (this.chatClient) {
      await this.chatClient.disconnectUser();
      this.chatClient = null;
      this.currentChannel = null;
      this.isConnectedSubject.next(false);
      this.currentUserIdSubject.next(null);
      this.currentChannelSubject.next(null);
      console.log('Usuario desconectado de Stream Chat');
    }
  }

  /**
   * Obtener o crear un canal
   */
  async getChannel(channelType: string, channelId: string): Promise<Channel> {
    if (!this.chatClient) {
      throw new Error('Cliente no está conectado');
    }

    const channel = this.chatClient.channel(channelType, channelId);
    await channel.watch();
    
    this.currentChannel = channel;
    this.currentChannelSubject.next(channel);
    
    return channel;
  }

  /**
   * Crear canal con miembros
   */
  async createChannel(
    channelType: string,
    channelId: string,
    members: string[],
    name?: string
  ): Promise<Channel> {
    if (!this.chatClient) {
      throw new Error('Cliente no está conectado');
    }

    const channel = this.chatClient.channel(channelType, channelId, {
      members,
      ...(name && { name }),
    } as any);

    await channel.create();
    
    this.currentChannel = channel;
    this.currentChannelSubject.next(channel);
    
    return channel;
  }

  /**
   * Enviar mensaje al canal actual
   */
  async sendMessage(text: string): Promise<void> {
    if (!this.currentChannel) {
      throw new Error('No hay canal activo');
    }

    await this.currentChannel.sendMessage({ text });
  }

  /**
   * Obtener lista de canales del usuario
   */
  async getUserChannels(): Promise<Channel[]> {
    if (!this.chatClient || !this.currentUserIdSubject.value) {
      throw new Error('Cliente no está conectado');
    }

    const filter: ChannelFilters = {
      type: 'messaging',
      members: { $in: [this.currentUserIdSubject.value] },
    };

    const sort: ChannelSort = { last_message_at: -1 };
    const options: ChannelOptions = { limit: 30 };

    const channels = await this.chatClient.queryChannels(filter, sort, options);
    return channels;
  }

  /**
   * Marcar canal como leído
   */
  async markChannelAsRead(): Promise<void> {
    if (this.currentChannel) {
      await this.currentChannel.markRead();
    }
  }

  /**
   * Obtener cliente Stream Chat (para uso avanzado)
   */
  getClient(): StreamChat | null {
    return this.chatClient;
  }

  /**
   * Obtener canal actual
   */
  getCurrentChannel(): Channel | null {
    return this.currentChannel;
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}
