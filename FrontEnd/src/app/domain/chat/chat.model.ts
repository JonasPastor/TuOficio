/**
 * Modelos de dominio para el sistema de Chat
 */

export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  role?: 'usuario' | 'profesional';
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'video';
  url: string;
  name?: string;
}

export interface ChatChannel {
  id: string;
  type: 'messaging' | 'team';
  name?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  metadata?: Record<string, any>;
}

export interface ChatInitData {
  apiKey: string;
  userId: string;
  token: string;
}

export interface CreateChannelRequest {
  channelType: string;
  channelId: string;
  creatorId: string;
  members: string[];
  name?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  channelType: string;
  channelId: string;
  userId: string;
  text: string;
  attachments?: ChatAttachment[];
}

export interface ConversationWithProfessional {
  userId: string;
  professionalId: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  available: boolean;
}
