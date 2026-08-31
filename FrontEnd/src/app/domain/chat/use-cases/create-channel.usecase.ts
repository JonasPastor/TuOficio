import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../chat.repository';
import { CreateChannelRequest } from '../chat.model';

/**
 * Use Case: Crear Canal de Chat
 * Crea un nuevo canal de conversación
 */
@Injectable()
export class CreateChannelUseCase {
  private readonly repository = inject(ChatRepository);

  execute(request: CreateChannelRequest): Observable<{ status: string; channelId: string }> {
    // Validaciones
    if (!request.channelId || !request.channelType) {
      throw new Error('Channel ID y Channel Type son requeridos');
    }

    if (!request.creatorId) {
      throw new Error('Creator ID es requerido');
    }

    if (!request.members || request.members.length === 0) {
      throw new Error('Debe haber al menos un miembro en el canal');
    }

    return this.repository.createChannel(request);
  }
}
