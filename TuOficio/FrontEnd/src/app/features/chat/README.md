# Integración de Stream Chat en Angular

Este proyecto implementa Stream Chat siguiendo la arquitectura Clean Architecture con Angular 20.

## 📁 Estructura del Proyecto

```
src/app/
├── domain/chat/                    # Capa de Dominio
│   ├── chat.model.ts              # Modelos e interfaces
│   ├── chat.repository.ts         # Contrato del repositorio
│   └── use-cases/                 # Casos de uso
│       ├── initialize-chat.usecase.ts
│       ├── create-channel.usecase.ts
│       ├── send-message.usecase.ts
│       └── get-user-conversations.usecase.ts
│
├── data/chat/                      # Capa de Datos
│   └── chat.http.repository.ts    # Implementación HTTP
│
└── features/chat/                  # Capa de Presentación
    ├── chat.page.ts               # Página principal
    ├── chat.page.html
    ├── chat.page.scss
    ├── services/
    │   └── stream-chat.service.ts # Servicio Stream Chat SDK
    └── components/
        ├── chat-channel-list/     # Lista de conversaciones
        ├── chat-channel/          # Vista de chat
        └── professional-selection-modal/ # Modal de profesionales
```

## 🚀 Configuración

### 1. Instalar Dependencias

El paquete `stream-chat-angular` ya está instalado en `package.json`.

```bash
npm install
```

### 2. Configurar API Key de Stream

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',
  streamChat: {
    apiKey: 'TU_STREAM_API_KEY_AQUI', // ⚠️ Reemplazar
    apiUrl: 'http://localhost:8081/api/v1/chat'
  }
};
```

### 3. Backend Endpoints Requeridos

El frontend espera estos endpoints en tu backend:

- `GET /api/v1/chat/init?userId={userId}` - Inicializar chat
- `POST /api/v1/chat/users` - Crear/actualizar usuario
- `POST /api/v1/chat/channels` - Crear canal
- `POST /api/v1/chat/channels/members` - Agregar miembros
- `POST /api/v1/chat/messages` - Enviar mensaje
- `GET /api/v1/chat/user/{userId}/conversations` - Obtener conversaciones
- `GET /api/v1/chat/professionals/available` - Listar profesionales
- `POST /api/v1/chat/conversations/with-professional` - Crear conversación con profesional

## 🎯 Uso

### Iniciar la Aplicación

```bash
npm start
```

Navega a `http://localhost:4200/chat`

### Flujo de Usuario

1. **Login**: Ingresa tu ID de usuario
2. **Ver Conversaciones**: Lista de chats existentes
3. **Nueva Consulta**: Click en "➕" para abrir modal de profesionales
4. **Seleccionar Profesional**: Click en un profesional para iniciar chat
5. **Chatear**: Envía y recibe mensajes en tiempo real

## 🏗️ Arquitectura

### Clean Architecture (3 capas)

#### 1. **Domain** (Capa de Negocio)
- **Modelos**: Entidades y DTOs (`chat.model.ts`)
- **Repositorio**: Interfaz abstracta (`chat.repository.ts`)
- **Use Cases**: Lógica de negocio aislada

#### 2. **Data** (Capa de Datos)
- **Repository Implementation**: Implementa el contrato del dominio
- Comunicación HTTP con el backend

#### 3. **Features** (Capa de Presentación)
- **Componentes**: UI standalone components
- **Servicios**: Integración con Stream Chat SDK
- **Pages**: Coordinan componentes y lógica

### Dependency Injection

Los providers están registrados en `src/app/core/providers.ts`:

```typescript
export const CORE_PROVIDERS: Provider[] = [
  { provide: ChatRepository, useClass: ChatHttpRepository },
  InitializeChatUseCase,
  CreateChannelUseCase,
  SendMessageUseCase,
  GetUserConversationsUseCase,
];
```

## 🔧 Componentes Principales

### StreamChatService

Servicio que maneja la integración con Stream Chat SDK:

```typescript
// Conectar usuario
await streamChatService.connectUser(userId).toPromise();

// Obtener canal
const channel = await streamChatService.getChannel('messaging', 'channel-id');

// Enviar mensaje
await streamChatService.sendMessage('Hola mundo');
```

### ChatPage

Página principal que coordina:
- Login de usuario
- Listado de canales
- Vista de chat
- Modal de profesionales

### ChatChannelListComponent

- Lista todas las conversaciones del usuario
- Muestra badges de mensajes no leídos
- Emite evento al seleccionar un canal

### ChatChannelComponent

- Muestra mensajes del canal
- Suscripción a nuevos mensajes en tiempo real
- Input para enviar mensajes

### ProfessionalSelectionModalComponent

- Modal para seleccionar un profesional
- Lista profesionales disponibles
- Crea conversación al seleccionar

## 🔐 Autenticación

El sistema actual usa un ID de usuario simple. En producción:

1. Integrar con tu `AuthService`
2. Obtener userId del usuario autenticado
3. Eliminar el formulario de login temporal

```typescript
// Ejemplo integración con Auth
ngOnInit(): void {
  this.authService.currentUser$.subscribe(user => {
    if (user) {
      this.streamChatService.connectUser(user.id);
    }
  });
}
```

## 📡 Stream Chat Features

### Mensajes en Tiempo Real

```typescript
// En ChatChannelComponent
this.channel.on('message.new', (event) => {
  // Nuevo mensaje recibido
  this.messages.push(this.mapMessage(event.message));
});
```

### Indicadores de Estado

- ✅ Conectado/Desconectado
- 🔵 Mensajes no leídos
- ⏰ Timestamps de mensajes

### Canales Privados

Los canales se crean con ID único para evitar duplicados:

```typescript
const channelId = `dm-${Math.min(userId1, userId2)}-${Math.max(userId1, userId2)}`;
```

## 🎨 Personalización

### Estilos

Cada componente tiene su propio archivo `.scss`. Puedes personalizar:

- Colores (variables CSS)
- Tamaños de fuente
- Espaciados
- Animaciones

### Extensión

Para agregar funcionalidades:

1. **Nuevo Use Case**: Crear en `domain/chat/use-cases/`
2. **Actualizar Repository**: Agregar método en interfaz y implementación
3. **UI Component**: Crear componente standalone
4. **Integrar**: Usar en `ChatPage` o componentes existentes

## 🐛 Debugging

### Console Logs

Los servicios y componentes incluyen logs útiles:

```typescript
console.log('✅ Usuario conectado:', userId);
console.error('❌ Error al conectar:', error);
```

### Stream Chat DevTools

Stream provee herramientas de debugging en su dashboard:
- https://getstream.io/dashboard/

### Angular DevTools

Usa Angular DevTools para inspeccionar:
- Estado de componentes
- Observables activos
- Inyección de dependencias

## 📚 Recursos

- [Stream Chat Angular SDK](https://getstream.io/chat/angular/tutorial/)
- [Stream Chat API Docs](https://getstream.io/chat/docs/)
- [Angular Standalone Components](https://angular.dev/guide/components/importing)

## ⚠️ Notas Importantes

1. **API Key**: Nunca commitear la API key en producción
2. **Token Security**: Los tokens deben generarse en el backend
3. **Error Handling**: Implementar manejo robusto de errores
4. **Offline Support**: Considerar estado offline
5. **Performance**: Limitar número de mensajes cargados

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Seguir la arquitectura Clean Architecture
2. Usar componentes standalone
3. Inyectar dependencias correctamente
4. Agregar tipos TypeScript
5. Documentar código complejo

---

**Desarrollado con Clean Architecture + Angular + Stream Chat** 🚀
