import React, { useState } from 'react';
import { useSession } from '@/entities/session';
import { useChats } from '@/entities/chat';

export const Sidebar: React.FC = () => {
    const { logout, idInstance } = useSession();
    const { chats, activeChatId, setActiveChatId, createChat } = useChats();
    const [phoneInput, setPhoneInput] = useState('');

    const handleCreateChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneInput.trim()) {
            createChat(phoneInput.trim());
            setPhoneInput('');
        }
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <span style={styles.profile}>Инстанс: {idInstance}</span>
                <button onClick={logout} style={styles.logoutBtn}>Выйти</button>
            </div>
            <form onSubmit={handleCreateChat} style={styles.form}>
                <input
                    type="text"
                    placeholder="Номер телефона получателя"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.addBtn}>+</button>
            </form>
            <div style={styles.chatList}>
                {chats.length === 0 ? (
                    <div style={styles.empty}>Нет активных чатов. Введите номер телефона сверху.</div>
                ) : (
                    chats.map(chat => {
                        const isActive = chat.id === activeChatId;
                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                style={{
                                    ...styles.chatItem,
                                    background: isActive ? '#f0f4f9' : 'transparent',
                                }}
                            >
                                <div style={styles.avatar}>{chat.name[1] || 'U'}</div>
                                <div style={styles.chatInfo}>
                                    <div style={styles.chatName}>{chat.name}</div>
                                    <div style={styles.chatPreview}>Открыть диалог</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    sidebar: { width: '320px', display: 'flex', flexDirection: 'column' as const, borderRight: '1px solid #e0e0e0', background: '#fff' },
    header: { padding: '14px', background: '#2481cc', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    profile: { fontSize: '14px', fontWeight: 'bold' as const },
    logoutBtn: { background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' },
    form: { display: 'flex', gap: '8px', padding: '10px', borderBottom: '1px solid #e0e0e0' },
    input: { flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' },
    addBtn: { padding: '8px 16px', background: '#2481cc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const },
    chatList: { flex: 1, overflowY: 'auto' as const },
    empty: { padding: '20px', textAlign: 'center' as const, color: '#999', fontSize: '13px' },
    chatItem: { display: 'flex', padding: '12px', gap: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', transition: 'background 0.2s' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' as const },
    chatInfo: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' },
    chatName: { fontWeight: 'bold' as const, fontSize: '14px', color: '#333' },
    chatPreview: { fontSize: '12px', color: '#888' },
};