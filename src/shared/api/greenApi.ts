export interface SendMessagePayload {
    chatId: string;
    message: string;
}

export interface SendMessageResponse {
    idMessage: string;
}

export interface ReceiveNotificationResponse {
    receiptId: number;
    body: {
        typeWebhook: string;
        instanceData: {
            idInstance: number;
        };
        timestamp: number;
        idMessage: string;
        senderData?: {
            chatId: string;
            chatName: string;
        };
        messageData?: {
            typeMessage: string;
            textMessageData?: {
                textMessage: string;
            };
        };
    };
}

export class GreenApiService {
    private readonly apiTokenInstance: string;
    private readonly baseUrl: string;

    constructor(idInstance: string, apiTokenInstance: string, apiUrl: string) {
        this.apiTokenInstance = apiTokenInstance;
        const baseHost = apiUrl || 'https://api.green-api.com';
        const cleanHost = baseHost.replace(/\/+\$/, '');
        this.baseUrl = `${cleanHost}/waInstance${idInstance.trim()}`;
    }

    // Проверка состояния инстанса (для валидации при авторизации)
    async getStateInstance(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/getStateInstance/${this.apiTokenInstance}`);
            if (!response.ok) return false;
            const data = await response.json();
            return data.stateInstance === 'authorized' || data.stateInstance === 'notAuthorized';
        } catch {
            return false;
        }
    }

    // Отправка текстового сообщения
    async sendMessage(chatId: string, message: string): Promise<SendMessageResponse | null> {
        try {
            const response = await fetch(`${this.baseUrl}/sendMessage/${this.apiTokenInstance}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, message }),
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            return null;
        }
    }

    // Получение входящего уведомления (Long Polling)
    async receiveNotification(): Promise<ReceiveNotificationResponse | null> {
        try {
            const response = await fetch(`${this.baseUrl}/receiveNotification/${this.apiTokenInstance}`);

            // Если статус 204 или ответ не ок — сразу выходим, не пытаясь ничего парсить
            if (!response.ok || response.status === 204) return null;

            // Читаем тело ответа как текст, чтобы застраховаться от пустых ответов
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') return null;

            // И только если текст реально есть, превращаем его в объект
            return JSON.parse(responseText);
        } catch (error) {
            // Больше не спамим в консоль технической ошибкой пустого JSON, так как для Long Polling отсутствие данных — это норма
            console.error('Ошибка сети при получении уведомления:', error);
            return null;
        }
    }

    // Удаление уведомления из очереди после обработки
    async deleteNotification(receiptId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/deleteNotification/${this.apiTokenInstance}/${receiptId}`, {
                method: 'DELETE',
            });
            if (!response.ok) return false;
            const data = await response.json();
            return data.result === true;
        } catch (error) {
            console.error('Ошибка удаления уведомления:', error);
            return false;
        }
    }
}