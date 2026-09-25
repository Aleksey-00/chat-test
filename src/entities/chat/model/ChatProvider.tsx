import React, { useState } from 'react';
import type { Chat } from './types';
import type { Message } from '@/entities/message';
import { ChatContext } from './ChatContext';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const createChat = (phone: string) => {
        const formattedId = phone.replace(/\D/g, '');
        if (!formattedId) return;

        const exists = chats.find(c => c.id === formattedId);
        if (!exists) {
            const newChat: Chat = {
                id: formattedId,
                phoneNumber: phone,
                name: `+${formattedId}`,
            };
            setChats(prev => [newChat, ...prev]);
        }
        setActiveChatId(formattedId);
    };

    const addMessage = (chatId: string, text: string, sender: 'me' | 'them') => {
        const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            chatId,
            text,
            sender,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newMessage]);
    };

    return (
        <ChatContext.Provider value={{ chats, messages, activeChatId, setActiveChatId, createChat, addMessage }}>
            {children}
        </ChatContext.Provider>
    );
};