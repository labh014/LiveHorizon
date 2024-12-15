import React from 'react';
import styles from '../style/lobbyPage.module.css';

const LobbyPage = ({ username, setUsername, connect, localVideoRef }) => {
  return (
    <div className={`${styles.lobbyPage} d-flex justify-content-center align-items-center vh-100`}>
      <div className={`${styles.card} shadow-lg p-4`} style={{ maxWidth: '450px', width: '100%' }}>
        <h3 className="text-center text-primary mb-4">Join the Video Lobby</h3>
        <form>
          <div className="mb-4">
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
          <button
            type="button"
            className={`btn btn-primary ${styles.btnPrimary} w-100 mb-4`}
            onClick={connect}
          >
            Connect Now
          </button>
        </form>
        <div className="mt-4 text-center">
          <div className={`${styles.videoContainer} rounded shadow-lg border border-primary`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className={`${styles.video}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;