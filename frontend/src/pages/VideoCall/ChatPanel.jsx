import React, { useEffect, useRef } from 'react'
import { Button, TextField } from '@mui/material'

function ChatPanel({ messages, message, setMessage, onSend, currentUser }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div style={{ width: 360, background: '#ffffff', borderLeft: '1px solid #e9ecef', height: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', right: 0, top: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h6 style={{ margin: 0 }}>Chat</h6>
        <span style={{ fontSize: 12, color: '#6c757d' }}>{messages.length} messages</span>
      </div>
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, overflowY: 'auto', flex: 1 }}>
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
      <div style={{ padding: 12, borderTop: '1px solid #e9ecef' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="contained" onClick={onSend}>Send</Button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
