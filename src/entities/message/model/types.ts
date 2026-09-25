export interface Message {
    id: string;
    chatId: string;
    text: string;
    sender: 'me' | 'them';
    timestamp: number;
}