import { Provider } from '@angular/core';
import { OficioRepository } from '../domain/oficios/oficio.repository';
import { OficioHttpRepository } from '../data/oficios/oficio.http.repository';
import { UsuarioRepository } from '../domain/usuario/usuario.repository';
import { UsuarioHttpRepository } from '../data/usuario/usuario.http.repository';
import { ProfesionalRepository } from '../domain/profesionales/profesional.repository';
import { ProfesionalHttpRepository } from '../data/profesionales/profesional.http.repository';
import { SolicitudRepository } from '../domain/solicitudes/solicitud.repository';
import { SolicitudHttpRepository } from '../data/solicitudes/solicitud.http.repository';
import { ChatRepository } from '../domain/chat/chat.repository';
import { ChatHttpRepository } from '../data/chat/chat.http.repository';
import { TrabajoRepository } from '../domain/trabajo/trabajo.repository';
import { TrabajoHttpRepository } from '../data/trabajos/trabajo.http.repository';
import { PagoRepository } from '../domain/pago/pago.repository';
import { PagoHttpRepository } from '../data/pagos/pago.http.repository';

// Use Cases
import { InitializeChatUseCase } from '../domain/chat/use-cases/initialize-chat.usecase';
import { CreateChannelUseCase } from '../domain/chat/use-cases/create-channel.usecase';
import { SendMessageUseCase } from '../domain/chat/use-cases/send-message.usecase';
import { GetUserConversationsUseCase } from '../domain/chat/use-cases/get-user-conversations.usecase';

export const CORE_PROVIDERS: Provider[] = [
  { provide: OficioRepository, useClass: OficioHttpRepository },
  { provide: UsuarioRepository, useClass: UsuarioHttpRepository },
  { provide: ProfesionalRepository, useClass: ProfesionalHttpRepository },
  { provide: SolicitudRepository, useClass: SolicitudHttpRepository },
  { provide: ChatRepository, useClass: ChatHttpRepository },
  { provide: TrabajoRepository, useClass: TrabajoHttpRepository },
  { provide: PagoRepository, useClass: PagoHttpRepository },
  // Chat Use Cases
  InitializeChatUseCase,
  CreateChannelUseCase,
  SendMessageUseCase,
  GetUserConversationsUseCase,
];
