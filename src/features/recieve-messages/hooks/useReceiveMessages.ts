import { useEffect, useRef } from 'react';
import { useSession } from '@/entities/session';
import { useChats } from '@/entities/chat';

export const useReceiveMessages = () => {
    const { apiService, isAuth } = useSession();
    const { addMessage, createChat } = useChats();
    const isPollingRef = useRef(false);

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

                    if (body.typeWebhook === 'incomingMessageReceived' && body.messageData?.typeMessage === 'textMessage') {
                        const fullChatId = body.senderData?.chatId;
                        const messageText = body.messageData.textMessageData?.textMessage;

                        if (fullChatId && messageText) {
                            const cleanChatId = fullChatId.split('@')[0];

                            createChat(cleanChatId);

                            addMessage(cleanChatId, messageText, 'them');
                        }
                    }

                    // Обязательно удаляем уведомление из очереди на сервере
                    await apiService.deleteNotification(receiptId);
                }
            } catch (error) {
                console.error('Ошибка при получении сообщений:', error);
            } finally {
                isPollingRef.current = false;
                if (isMounted) {
                    // Повторяем опрос через полсекунды
                    setTimeout(pollMessages, 500);
                }
            }
        };

        pollMessages();

        return () => {
            isMounted = false;
        };
    }, [isAuth, apiService, addMessage, createChat]);
};