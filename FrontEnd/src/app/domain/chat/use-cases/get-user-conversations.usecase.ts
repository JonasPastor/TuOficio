import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../chat.repository';
import { ChatChannel } from '../chat.model';

/**
 * Use Case: Obtener Conversaciones de Usuario
 * Lista todas las conversaciones/canales en los que participa el usuario
 */
@Injectable()
export class GetUserConversationsUseCase {
  private readonly repository = inject(ChatRepository);

  execute(userId: string): Observable<ChatChannel[]> {
    if (!userId) {
      throw new Error('User ID es requerido');
    }
    return this.repository.getUserConversations(userId);
  }
}
