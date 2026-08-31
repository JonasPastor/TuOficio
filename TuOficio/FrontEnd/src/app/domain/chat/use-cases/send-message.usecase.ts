import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../chat.repository';
import { SendMessageRequest } from '../chat.model';

/**
 * Use Case: Enviar Mensaje
 * Envía un mensaje de texto a un canal específico
 */
@Injectable()
export class SendMessageUseCase {
  private readonly repository = inject(ChatRepository);

  execute(request: SendMessageRequest): Observable<{ status: string; message: string }> {
    // Validaciones
    if (!request.text || request.text.trim() === '') {
      throw new Error('El mensaje no puede estar vacío');
    }

    if (!request.channelId || !request.channelType) {
      throw new Error('Channel ID y Channel Type son requeridos');
    }

    if (!request.userId) {
      throw new Error('User ID es requerido');
    }

    return this.repository.sendMessage(request);
  }
}
