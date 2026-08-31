import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../chat.repository';
import { ChatInitData } from '../chat.model';

/**
 * Use Case: Inicializar Chat
 * Obtiene los datos necesarios para conectar a Stream Chat (API Key, Token)
 */
@Injectable()
export class InitializeChatUseCase {
  private readonly repository = inject(ChatRepository);

  execute(userId: string): Observable<ChatInitData> {
    if (!userId) {
      throw new Error('User ID es requerido para inicializar el chat');
    }
    return this.repository.initializeChat(userId);
  }
}
