import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/entities/session';
import { useChats } from '@/entities/chat';

export const ChatWindow: React.FC = () => {
    const { apiService } = useSession();
    const { chats, messages, activeChatId, addMessage } = useChats();
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = chats.find(c => c.id === activeChatId);
    const currentMessages = messages.filter(m => m.chatId === activeChatId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !apiService || !activeChatId || isSending) return;

        setIsSending(true);
        const messageText = text.trim();
        const targetChatId = `${activeChatId}@c.us`;

        const response = await apiService.sendMessage(targetChatId, messageText);
        setIsSending(false);

        if (response) {
            addMessage(activeChatId, messageText, 'me');
            setText('');
        } else {
            alert('Не удалось отправить сообщение. Проверьте статус инстанса в панели Green-API.');
        }
    };

    if (!activeChatId || !activeChat) {
        return (
            <div style={styles.placeholderContainer}>
                <div style={styles.placeholderText}>Выберите чат или создайте новый по номеру телефона получателя, чтобы начать общение</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.avatar}>{activeChat.name[1] || 'U'}</div>
                <div>
                    <div style={styles.chatName}>{activeChat.name}</div>
                    <div style={styles.status}>в сети</div>
                </div>
            </div>
            <div style={styles.messagesArea}>
                {currentMessages.map(msg => {
                    const isMe = msg.sender === 'me';
                    return (
                        <div
                            key={msg.id}
                            style={{
                                ...styles.messageWrapper,
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    ...styles.messageBubble,
                                    background: isMe ? '#eeffde' : '#fff',
                                    borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                }}
                            >
                                <div style={styles.messageText}>{msg.text}</div>
                                <div style={styles.messageTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={styles.formContainer}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Напишите сообщение..."
                    style={styles.input}
                    disabled={isSending}
                />
                <button type="submit" style={styles.sendBtn} disabled={isSending}>
                    {isSending ? '...' : 'Отправить'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { flex: 1, display: 'flex', flexDirection: 'column' as const, background: '#e5ddd5' },
    placeholderContainer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' },
    placeholderText: { padding: '20px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '20px', color: '#666', fontSize: '14px', maxWidth: '350px', textAlign: 'center' as const },
    header: { padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '15px' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' as const },
    chatName: { fontWeight: 'bold' as const, fontSize: '15px', color: '#333' },
    status: { fontSize: '12px', color: '#0088cc' },
    messagesArea: { flex: 1, padding: '20px', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    messageWrapper: { display: 'flex', width: '100%' },
    messageBubble: { maxWidth: '65%', padding: '8px 12px', display: 'flex', flexDirection: 'column' as const, gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    messageText: { fontSize: '14px', color: '#333', wordBreak: 'break-word' as const },
    messageTime: { fontSize: '10px', color: '#999', alignSelf: 'flex-end' as const },
    formContainer: { display: 'flex', padding: '15px', background: '#f0f2f5', borderTop: '1px solid #e0e0e0', gap: '10px' },
    input: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '15px', background: '#fff' },
    sendBtn: { padding: '12px 24px', background: '#2481cc', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '14px' },
};