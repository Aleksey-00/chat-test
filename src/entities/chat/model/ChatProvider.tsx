import React, { useState, useEffect } from 'react';
import type { Chat } from './types';
import type { Message } from '@/entities/message';
import { ChatContext } from './ChatContext';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem('tg_chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('tg_messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tg_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('tg_messages', JSON.stringify(messages));
  }, [messages]);

  const createChat = (phoneOrId: string) => {
    const formattedId = phoneOrId.replace(/\D/g, '');
    if (!formattedId) return;

    const exists = chats.find((c) => c.id === formattedId);
    if (!exists) {
      const newChat: Chat = {
        id: formattedId,
        phoneNumber: phoneOrId,
        name: phoneOrId.startsWith('+') ? phoneOrId : `+${formattedId}`,
      };
      setChats((prev) => [newChat, ...prev]);
    }
    setActiveChatId(formattedId);
  };

  const updateChatId = (oldId: string, newId: string) => {
    if (oldId === newId) return;

    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === oldId ? { ...chat, id: newId } : chat)),
    );

    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.chatId === oldId ? { ...msg, chatId: newId } : msg)),
    );

    setActiveChatId(newId);
  };

  const addMessage = (chatId: string, text: string, sender: 'me' | 'them') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      chatId,
      text,
      sender,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <ChatContext.Provider
      value={
        {
          chats,
          messages,
          activeChatId,
          setActiveChatId,
          createChat,
          addMessage,
          updateChatId,
        } as never
      }
    >
      {children}
    </ChatContext.Provider>
  );
};
