import React from 'react';
import styles from '../style/lobbyPage.module.css';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import IconButton from '@mui/material/IconButton';

const LobbyPage = ({ username, setUsername, connect, localVideoRef, video, setVideo, audio, setAudio }) => {
  return (
    <div className={`${styles.lobbyPage} d-flex justify-content-center align-items-center vh-100`}>
      <div className={`${styles.card} shadow-lg p-4`} style={{ maxWidth: '520px', width: '100%' }}>
        <h3 className="text-center text-primary mb-3">Preview & Join</h3>
        <p className="text-center text-muted mb-4">Set your name and check your camera/mic before joining</p>
        <div className="mb-3">
          <label htmlFor="username" className="form-label fw-bold">Your Name</label>
          <input
            type="text"
            id="username"
            className={`form-control ${styles.formControl}`}
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
          <IconButton style={{ color: "#555" }} onClick={() => setVideo(!video)}>
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
          <IconButton style={{ color: "#555" }} onClick={() => setAudio(!audio)}>
            {audio ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </div>

        <div className="mb-3 text-center">
          <div className={`${styles.videoContainer} rounded shadow-lg border border-primary`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className={`${styles.video}`}
            />
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-primary ${styles.btnPrimary} w-100`}
          onClick={connect}
          disabled={!username || username.trim() === ''}
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
};

export default LobbyPage;