import React, { useEffect, useRef, useMemo } from 'react'
import { Button, TextField } from '@mui/material'

function ChatPanel({ messages, message, setMessage, onSend, currentUser, onClose }) {
  const listRef = useRef(null)
  const isSmall = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div style={{ width: isSmall ? '88vw' : 360, maxWidth: '100vw', background: '#ffffff', borderLeft: '1px solid #e9ecef', height: isSmall ? '100dvh' : '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 6 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h6 style={{ margin: 0 }}>Chat</h6>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#6c757d' }}>{messages.length} messages</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, lineHeight: 1, cursor: 'pointer', color: '#6c757d' }} aria-label="Close chat">×</button>
        </div>
      </div>
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, overflowY: 'auto', flex: 1, minHeight: 0, padding: '8px 12px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No messages yet</p>
        ) : (
          messages.map((item, index) => {
            const isMine = item.sender === currentUser || item.sender === 'You'
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    background: isMine ? '#0d6efd' : '#f1f3f5',
                    color: isMine ? '#fff' : '#212529',
                    borderRadius: 12,
                    padding: '8px 12px',
                    maxWidth: 240
                  }}
                >
                  {!isMine && (
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, opacity: 0.8 }}>{item.sender || 'User'}</div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.data}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div style={{ position: 'sticky', bottom: 0, padding: 12, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #e9ecef', background: '#ffffff' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Type a message"
            variant="outlined"
            size="small"
            value={message}
            onChange={(e) => { setMessage(e.target.value) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button variant="contained" onClick={onSend}>Send</Button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
