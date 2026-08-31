import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StreamChat, Channel } from 'stream-chat';
import { environment } from '../../../../environments/environment';
import { SolicitudRepository } from '../../../domain/solicitudes/solicitud.repository';

@Injectable({
  providedIn: 'root'
})
export class StreamChatService {
  private chatClient!: StreamChat;
  private currentUserId: string = '';
  private http = inject(HttpClient);
  private solicitudRepository = inject(SolicitudRepository);
  private isProfessional: boolean = false; // ✅ Nuevo: guardar si es profesional
  private realUserId: string = ''; // ✅ Nuevo: ID real del usuario (no el del profesional)

  get userId(): string {
    return this.currentUserId;
  }

  async initializeChat(
    userId: string, 
    userName: string, 
    isProfessional: boolean = false,
    realUserId?: string
  ): Promise<StreamChat> {
    try {
      // ✅ Prevenir doble inicialización si ya está conectado el mismo usuario
      if (this.chatClient && this.currentUserId === userId && this.chatClient.user) {
        console.log('ℹ️ Chat ya inicializado para el usuario:', userId);
        return this.chatClient;
      }

      // ✅ Desconectar usuario anterior si existe
      if (this.chatClient && this.chatClient.user) {
        console.log('🔄 Desconectando usuario anterior antes de reconectar...');
        await this.chatClient.disconnectUser();
      }

      this.isProfessional = isProfessional;
      this.realUserId = realUserId || userId;

      const initData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/chat/init?userId=${userId}`)
      );

      console.log('📥 Datos de inicialización:', initData);

      this.chatClient = StreamChat.getInstance(initData.apiKey);

      const fullName = initData.fullName || userName;
      await this.chatClient.connectUser(
        {
          id: userId,
          name: fullName,
        },
        initData.token
      );

      this.currentUserId = userId;
      console.log('✅ Chat inicializado con nombre:', fullName);
      
      return this.chatClient;
    } catch (error) {
      console.error('❌ Error al inicializar chat:', error);
      throw error;
    }
  }

  getChatClient(): StreamChat {
    return this.chatClient;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  async getUserChannels(): Promise<Channel[]> {
    if (!this.chatClient) {
      console.error('❌ Chat client no inicializado');
      return [];
    }

    try {
      const filter = { members: { $in: [this.currentUserId] } };
      const sort = [{ last_message_at: -1 as const }];
      
      const channels = await this.chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
        limit: 100,
      });

      console.log('✅ Canales obtenidos:', channels.length);
      return channels;
    } catch (error) {
      console.error('❌ Error al obtener canales:', error);
      return [];
    }
  }

  async createConversationWithProfessional(
    userId: string,
    professionalId: string
  ): Promise<Channel> {
    try {
      console.log('📤 Creando conversación:', { userId, professionalId });
      
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/v1/chat/conversations/with-professional`, {
          userId,
          professionalId
        })
      );

      console.log('📥 Respuesta del backend:', response);

      const channel = this.chatClient.channel(
        response.channelType,
        response.channelId
      );

      await channel.watch();
      
      console.log('✅ Canal creado:', {
        id: channel.id,
        type: channel.type,
        members: Object.keys(channel.state.members)
      });
      
      return channel;
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      throw error;
    }
  }

  async createConversationWithClient(
    professionalId: string,
    clientIdentifier: string // Puede ser idUsuario o idSolicitud
  ): Promise<Channel> {
    try {
      console.log('📤 Profesional creando conversación con cliente:', { professionalId, clientIdentifier });
      
      // ⚠️ Temporal: Si clientIdentifier es un idSolicitud, necesitamos obtener el idUsuario real
      // Intentar parsear como número para ver si es un idSolicitud
      let clientId = clientIdentifier;
      
      // Si parece ser un número grande (posible idSolicitud), intentar obtener la solicitud completa
      const numericId = parseInt(clientIdentifier);
      if (!isNaN(numericId) && numericId > 1000) {
        try {
          // Obtener detalle de la solicitud para extraer el ID del usuario
          const solicitudDetalle = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/api/v1/solicitudes/${numericId}`)
          );
          
          // Si el backend devuelve idUsuario, usarlo
          if (solicitudDetalle.idUsuario) {
            clientId = solicitudDetalle.idUsuario.toString();
            console.log('✅ ID de usuario extraído de solicitud:', clientId);
          }
        } catch (error) {
          console.warn('⚠️ No se pudo obtener detalle de solicitud, usando ID original');
        }
      }
      
      // Usar el mismo endpoint pero invertir los parámetros
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/v1/chat/conversations/with-professional`, {
          userId: clientId,
          professionalId: professionalId
        })
      );

      console.log('📥 Respuesta del backend:', response);

      const channel = this.chatClient.channel(
        response.channelType,
        response.channelId
      );

      await channel.watch();
      
      console.log('✅ Canal creado:', {
        id: channel.id,
        type: channel.type,
        members: Object.keys(channel.state.members)
      });
      
      return channel;
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      throw error;
    }
  }

  async getProfessionals(): Promise<any[]> {
    // ✅ Si es profesional, retornar array vacío
    if (this.isProfessional) {
      console.log('⚠️ Usuario es profesional, use getClients() en su lugar');
      return [];
    }

    try {
      // ✅ Usar realUserId en lugar de currentUserId
      const userIdForRequest = this.realUserId || this.currentUserId;
      
      console.log('🔍 Obteniendo solicitudes para usuario:', userIdForRequest);
      
      const solicitudes = await firstValueFrom(
        this.solicitudRepository.getSolicitudesByUsuario(parseInt(userIdForRequest))
      );

      console.log('✅ Solicitudes del usuario:', solicitudes);

      // ✅ Usar Map para eliminar duplicados por idProfesional
      const professionalMap = new Map<string, any>();
      
      solicitudes.forEach(solicitud => {
        const profId = solicitud.idProfesional.toString();
        // Solo agregar si no existe o si esta solicitud es más reciente
        if (!professionalMap.has(profId)) {
          professionalMap.set(profId, {
            id: profId,
            name: `${solicitud.nombreProfesional} ${solicitud.apellidoProfesional}`,
            specialty: solicitud.especialidad || 'Sin especialidad',
            imagenUrl: solicitud.imagenUrl,
            solicitudId: solicitud.idSolicitud,
            estado: solicitud.estado
          });
        }
      });

      // Convertir Map a array
      return Array.from(professionalMap.values());
    } catch (error: any) {
      console.error('❌ Error al obtener profesionales:', error);
      
      if (error?.status === 403) {
        console.log('⚠️ Usuario sin permisos para ver solicitudes');
        return [];
      }
      
      return [];
    }
  }

  async getClients(): Promise<any[]> {
    // ✅ Solo para profesionales
    if (!this.isProfessional) {
      console.log('⚠️ Usuario no es profesional, use getProfessionals() en su lugar');
      return [];
    }

    try {
      // Obtener todas las solicitudes del profesional (aceptadas y pendientes)
      const solicitudesAceptadas = await firstValueFrom(
        this.solicitudRepository.getSolicitud(parseInt(this.currentUserId), 'ACEPTADA')
      ).catch(() => []);

      const solicitudesPendientes = await firstValueFrom(
        this.solicitudRepository.getSolicitud(parseInt(this.currentUserId), 'PENDIENTE')
      ).catch(() => []);

      const todasSolicitudes = [...solicitudesAceptadas, ...solicitudesPendientes];
      
      console.log('✅ Solicitudes del profesional:', todasSolicitudes);

      // ✅ Usar Map para eliminar duplicados por nombreUsuario
      // Como el backend no devuelve idUsuario, usamos el nombre como clave
      const clientMap = new Map<string, any>();
      
      todasSolicitudes.forEach(solicitud => {
        const clientName = solicitud.nombreUsuario;
        // Solo agregar si no existe
        if (!clientMap.has(clientName)) {
          // Usar idSolicitud como ID temporal ya que no tenemos idUsuario
          // En producción, el backend debería devolver el ID del usuario
          clientMap.set(clientName, {
            id: solicitud.idSolicitud.toString(), // ⚠️ Temporal: usar idSolicitud
            name: solicitud.nombreUsuario,
            specialty: 'Cliente',
            imagenUrl: undefined, // Backend no devuelve imagen del cliente
            solicitudId: solicitud.idSolicitud
          });
        }
      });

      // Convertir Map a array
      return Array.from(clientMap.values());
    } catch (error: any) {
      console.error('❌ Error al obtener clientes:', error);
      return [];
    }
  }

  async disconnectUser(): Promise<void> {
    if (this.chatClient) {
      await this.chatClient.disconnectUser();
    }
  }
}