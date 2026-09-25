import type { Chat } from './types'
import type { Message } from '@/entities/message'

export interface ChatContextType {
    chats: Chat[];
    messages: Message[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    createChat: (phone: string) => void;
    addMessage: (chatId: string, text: string, sender: 'me' | 'them') => void;
}