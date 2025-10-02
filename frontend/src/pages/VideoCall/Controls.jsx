import React from 'react'
import IconButton from '@mui/material/IconButton'
import VideocamIcon from '@mui/icons-material/VideocamOutlined'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CallEndIcon from '@mui/icons-material/CallEnd'
import { Badge } from '@mui/material'

function Controls({ video, audio, screenAvailable, screen, onToggleVideo, onToggleAudio, onToggleScreen, onToggleChat, newMessages, onEnd }){
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <IconButton style={{ color: 'grey' }} onClick={onToggleVideo}>
        {video ? <VideocamIcon /> : <VideocamOffIcon />}
      </IconButton>
      <IconButton style={{ color: 'grey' }} onClick={onToggleAudio}>
        {audio ? <MicIcon /> : <MicOffIcon />}
      </IconButton>
      {screenAvailable ? (
        <IconButton onClick={onToggleScreen} style={{ color: 'grey' }}>
          {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
        </IconButton>
      ) : null}
      <Badge badgeContent={newMessages} max={500} color='primary'>
        <IconButton onClick={onToggleChat} style={{ color: 'grey' }}>
          <ChatIcon />
        </IconButton>
      </Badge>
      <IconButton style={{ color: 'red' }} onClick={onEnd}>
        <CallEndIcon />
      </IconButton>
    </div>
  )
}

export default Controls
