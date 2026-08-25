import React from 'react';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/MicOutlined';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/ChatOutlined';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { Badge, Tooltip } from '@mui/material';

function Controls({ video, audio, screenAvailable, screen, onToggleVideo, onToggleAudio, onToggleScreen, onToggleChat, newMessages, onEnd }) {
  
  const getButtonStyles = (isActive, isDanger = false) => {
    if (isDanger) {
      return {
        backgroundColor: '#ea4335',
        color: '#ffffff',
        width: '48px',
        height: '48px',
        '&:hover': {
          backgroundColor: '#d93025',
          transform: 'scale(1.08)',
        },
        transition: 'transform 0.2s, background-color 0.2s',
      };
    }

    // Toggle button style mapping (similar to Google Meet)
    return {
      backgroundColor: isActive ? '#3c4043' : '#ea4335',
      color: '#ffffff',
      border: isActive ? '1px solid #5f6368' : 'none',
      width: '40px',
      height: '40px',
      '&:hover': {
        backgroundColor: isActive ? '#4f5357' : '#d93025',
      },
      transition: 'background-color 0.2s, border-color 0.2s',
    };
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Mic toggle */}
      <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"} placement="top">
        <IconButton sx={getButtonStyles(audio)} onClick={onToggleAudio}>
          {audio ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Video toggle */}
      <Tooltip title={video ? "Turn Off Camera" : "Turn On Camera"} placement="top">
        <IconButton sx={getButtonStyles(video)} onClick={onToggleVideo}>
          {video ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Screen share toggle */}
      {screenAvailable && (
        <Tooltip title={screen ? "Stop Presenting" : "Present Now"} placement="top">
          <IconButton 
            sx={getButtonStyles(!screen)} // inverse active color
            onClick={onToggleScreen}
          >
            {screen ? <StopScreenShareIcon fontSize="small" /> : <ScreenShareIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      {/* Chat toggle */}
      <Tooltip title="Toggle Chat" placement="top">
        <IconButton 
          sx={{
            backgroundColor: '#3c4043',
            color: '#ffffff',
            border: '1px solid #5f6368',
            width: '40px',
            height: '40px',
            '&:hover': { backgroundColor: '#4f5357' }
          }}
          onClick={onToggleChat}
        >
          <Badge badgeContent={newMessages} color="primary" max={99}>
            <ChatIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* End Call */}
      <Tooltip title="Leave Call" placement="top">
        <IconButton sx={getButtonStyles(false, true)} onClick={onEnd}>
          <CallEndIcon />
        </IconButton>
      </Tooltip>

    </div>
  );
}

export default Controls;
