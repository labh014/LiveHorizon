import React, { useEffect, useRef, useMemo } from 'react';
import { TextField, IconButton } from '@mui/material';

function ChatPanel({ messages, message, setMessage, onSend, currentUser, onClose }) {
  const listRef = useRef(null);

  const isSmall = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ 
      width: isSmall ? '100vw' : '360px', 
      background: '#ffffff', 
      borderLeft: '1px solid #dadce0', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      right: 0, 
      top: 0, 
      bottom: 0, 
      zIndex: 100,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Header Panel */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid #f1f3f4', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div>
          <h6 style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#202124' }}>In-call messages</h6>
          <span style={{ fontSize: '11px', color: '#80868b' }}>Visible only to users in this call</span>
        </div>
        <IconButton onClick={onClose} size="small" aria-label="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </IconButton>
      </div>

      {/* Info notice block */}
      <div style={{
        backgroundColor: '#f8f9fa',
        margin: '12px 20px 4px 20px',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#5f6368',
        lineHeight: 1.4
      }}>
        Messages can only be seen by people in the call and are deleted when the call ends.
      </div>

      {/* Message List */}
      <div ref={listRef} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        overflowY: 'auto', 
        flex: 1, 
        padding: '16px 20px'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#80868b',
            gap: '8px'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#dadce0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style={{ fontSize: '13px' }}>No messages yet</span>
          </div>
        ) : (
          messages.map((item, index) => {
            const isMine = item.sender === currentUser || item.sender === 'You';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Sender Name tag */}
                <div style={{ 
                  fontSize: '11px', 
                  color: '#5f6368', 
                  marginBottom: '2px', 
                  marginLeft: isMine ? '0' : '4px',
                  marginRight: isMine ? '4px' : '0',
                  fontWeight: 500
                }}>
                  {isMine ? 'You' : (item.sender || 'User')}
                </div>
                
                {/* Bubble content */}
                <div
                  style={{
                    background: isMine ? '#e8f0fe' : '#f1f3f4',
                    color: isMine ? '#1a73e8' : '#202124',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    maxWidth: '85%',
                    fontSize: '13.5px',
                    lineHeight: 1.4,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word'
                  }}
                >
                  {item.data}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input box */}
      <div style={{ 
        padding: '16px 20px', 
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', 
        borderTop: '1px solid #f1f3f4', 
        background: '#ffffff' 
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Send a message to everyone"
            variant="outlined"
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSend();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                backgroundColor: '#f1f3f4',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: '1px solid #1a73e8' },
                paddingLeft: '14px'
              },
              '& .MuiInputBase-input': {
                fontSize: '14px',
                color: '#202124'
              }
            }}
          />
          <IconButton 
            onClick={onSend} 
            disabled={!message.trim()}
            sx={{ 
              backgroundColor: message.trim() ? '#1a73e8' : 'transparent',
              color: message.trim() ? '#ffffff' : '#5f6368',
              '&:hover': {
                backgroundColor: message.trim() ? '#1557b0' : 'rgba(0,0,0,0.04)'
              },
              width: '36px',
              height: '36px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
