import React from 'react';
import styles from '../style/lobbyPage.module.css';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';

// Replace this with your own image URL to customize the preview fallback
const placeholderUrl = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=80&auto=format&fit=crop';

const LobbyPage = ({ username, setUsername, connect, localVideoRef, video, setVideo, audio, setAudio }) => {
  return (
    <div className={`${styles.lobbyPage} d-flex flex-column justify-content-center align-items-center vh-100`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>🎥</span>
          <h2 className={styles.pageTitle}>Join Meeting</h2>
        </div>
        <p className={styles.subtitle}>Enter your details to start</p>
      </div>

      <div className={`${styles.card} shadow-lg`}> 
        <div className={styles.previewWrap}>
          <img src={placeholderUrl} alt="preview" className={styles.previewImage} />
          {/* Live preview will appear once permissions are granted by getMedia() */}
          <video ref={localVideoRef} autoPlay muted playsInline className={styles.previewVideo} />
        </div>

        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}><PersonOutlineIcon fontSize="small" /></span>
          <input
            type="text"
            id="username"
            className={styles.inputField}
            placeholder="e.g. Alex Chen"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.pill} onClick={() => setVideo(!video)}>
            {video ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
          </div>
          <div className={styles.pill} onClick={() => setAudio(!audio)}>
            {audio ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
          </div>
          <div className={styles.micToggle}>
            <span className={styles.micLabel}>Microphone</span>
            <Switch size="small" checked={!!audio} onChange={() => setAudio(!audio)} />
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-primary ${styles.joinBtn}`}
          onClick={connect}
          disabled={!username || username.trim() === ''}
        >
          Join Meeting
        </button>
      </div>

      <button type="button" className={styles.settingsLink} onClick={() => {}}>
        <SettingsRoundedIcon fontSize="small" />
        <span>Meeting settings</span>
      </button>
    </div>
  );
};

export default LobbyPage;