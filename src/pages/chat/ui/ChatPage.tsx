import React from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { ChatWindow } from '@/widgets/chat-window';
import { useReceiveMessages } from '@/features/recieve-messages';

export const ChatPage: React.FC = () => {
  useReceiveMessages();

  return (
    <div style={styles.container}>
      <div style={styles.window}>
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#dddbd1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  window: {
    width: '100%',
    maxWidth: '1396px',
    height: '100%',
    maxHeight: '100vh',
    background: '#fff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    display: 'flex',
    borderRadius: '3px',
    overflow: 'hidden',
  },
};
