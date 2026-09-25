import { useEffect, useRef } from 'react';
import { useSession } from '@/entities/session';
import { useChats } from '@/entities/chat';

export const useReceiveMessages = () => {
  const { apiService, isAuth } = useSession();
  const { addMessage, chats, createChat, updateChatId, messages } = useChats() as never;
  const isPollingRef = useRef(false);

  const processedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (messages && messages.length > 0) {
      messages.forEach((m: never) => processedMessageIds.current.add(m.id));
    }
  }, [messages?.length]);

  useEffect(() => {
    if (!isAuth || !apiService) return;

    let isMounted = true;
    isPollingRef.current = false;

    const pollMessages = async () => {
      if (isPollingRef.current || !isMounted) return;
      isPollingRef.current = true;

      try {
        const notification = await apiService.receiveNotification();

        if (notification && notification.receiptId) {
          const { receiptId, body } = notification;

          const currentMsgId = body?.idMessage || (body as never)?.idMessage;

          if (currentMsgId && processedMessageIds.current.has(currentMsgId)) {
            console.log(`[Дубликат] Сообщение ${currentMsgId} уже есть в UI. Пропускаем.`);
            await apiService.deleteNotification(receiptId);
            isPollingRef.current = false;
            if (isMounted) setTimeout(pollMessages, 100);
            return;
          }

          const isOurOwnMessage =
            body?.typeWebhook === 'outgoingMessageReceived' ||
            body?.typeWebhook === 'outgoingAPIMessageReceived' ||
            body?.typeWebhook === 'outgoingMessageStatus' ||
            body?.sendByApi === true;

          if (isOurOwnMessage) {
            if (currentMsgId) processedMessageIds.current.add(currentMsgId);
            await apiService.deleteNotification(receiptId);
            isPollingRef.current = false;
            if (isMounted) setTimeout(pollMessages, 100);
            return;
          }

          const messageText =
            body?.messageData?.textMessageData?.textMessage || body?.messageData?.textMessage;

          const fullChatId = body?.senderData?.chatId || (body as never)?.chatId;

          if (fullChatId && messageText) {
            const isProxySystemMessage =
              messageText.includes('ProxyMTProto') ||
              messageText.includes('shmelproxy') ||
              messageText.includes('Secret:');

            if (isProxySystemMessage) {
              console.log('[Фильтр] Обнаружено и заблокировано служебное прокси-сообщение.');
              if (currentMsgId) processedMessageIds.current.add(currentMsgId);
              await apiService.deleteNotification(receiptId);
              isPollingRef.current = false;
              if (isMounted) setTimeout(pollMessages, 100);
              return;
            }

            const cleanId = fullChatId.split('@')[0];

            const targetChat = chats.find((c: never) => {
              const cleanPhone = c.phoneNumber.replace(/\D/g, '');
              return c.id === cleanId || cleanPhone === cleanId;
            });

            if (!targetChat && chats.length === 1) {
              console.log(`[Склейка] Обновляем ID чата с ${chats[0].id} на ${cleanId}`);
              updateChatId(chats[0].id, cleanId);
              addMessage(cleanId, messageText, 'them');
            } else if (targetChat) {
              console.log(`[Успех] Добавляем входящий текст в чат: ${targetChat.id}`);
              addMessage(targetChat.id, messageText, 'them');
            } else {
              console.log(`[Авто-создание] Чат не найден. Создаем для ID: ${cleanId}`);
              createChat(cleanId);
              addMessage(cleanId, messageText, 'them');
            }

            if (currentMsgId) processedMessageIds.current.add(currentMsgId);
          }

          await apiService.deleteNotification(receiptId);
        }
      } catch (error) {
        console.error('Ошибка в цикле Long Polling:', error);
      } finally {
        isPollingRef.current = false;
        if (isMounted) {
          setTimeout(pollMessages, 350);
        }
      }
    };

    pollMessages();

    return () => {
      isMounted = false;
    };
  }, [isAuth, apiService, addMessage, createChat, chats, updateChatId]);
};
