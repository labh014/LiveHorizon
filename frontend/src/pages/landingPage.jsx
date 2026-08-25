import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../style/landingPage.module.css';

function LandingPage() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      const dayOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      
      const datePart = now.toLocaleDateString('en-US', dayOptions);
      const timePart = now.toLocaleTimeString('en-US', timeOptions);
      setCurrentTime(`${datePart}  •  ${timePart}`);
    };

    formatTime();
    const interval = setInterval(formatTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/${meetingCode.trim()}`);
    }
  };

  return (
    <div className={styles.landingPageContainer}>
      {/* Header Navigation */}
      <header className={styles.headerNav}>
        <Link to="/" className={styles.brand}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#1a73e8"/>
            <path d="M25 21V15C25 14.45 24.55 14 24 14H12C11.45 14 11 14.45 11 15V21C11 21.55 11.45 22 12 22H24C24.55 22 25 21.55 25 21ZM20 18H16V16H20V18ZM29 13L26 16V20L29 23V13Z" fill="white"/>
          </svg>
          <span>Live<strong>Horizon</strong></span>
        </Link>
        
        <div className={styles.navRight}>
          <span className={`${styles.navTime} d-none d-sm-inline`}>{currentTime}</span>
          {isAuthenticated ? (
            <Link to="/home" className={styles.btnPrimary}>Go to Home</Link>
          ) : (
            <Link to="/auth" className={styles.btnOutline} style={{ padding: '8px 18px', fontSize: '14px' }}>Sign in</Link>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className={`${styles.heroSection} container my-auto`}>
        <div className="row align-items-center g-5">
          {/* Left Column: Headline and Call to Actions */}
          <div className="col-lg-6 text-center text-lg-start">
            <h1 className={styles.heroTitle}>
              Premium video meetings.<br />
              Now <span className={styles.heroTitleHighlight}>free for everyone</span>.
            </h1>
            <p className={styles.heroDesc}>
              We re-engineered the service we built for secure meetings, 
              LiveHorizon, to make it free and available on any device.
            </p>

            {/* CTA Buttons */}
            <div className={styles.actionGroup}>
              {isAuthenticated ? (
                <Link to="/home" className={styles.btnPrimary}>
                  Start or Join a Meeting
                </Link>
              ) : (
                <>
                  <Link to="/auth" className={styles.btnPrimary}>
                    Sign in
                  </Link>
                  <Link to="/auth" className={styles.btnOutline} onClick={() => localStorage.setItem('authMode', 'register')}>
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Meeting code entry inline */}
            <form onSubmit={handleJoinMeeting} className={styles.codeInputGroup}>
              <div className={styles.inputWrapper}>
                <i className={`fa-solid fa-keyboard ${styles.inputIcon}`}></i>
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  className={styles.codeInput}
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className={styles.btnJoin}
                disabled={!meetingCode.trim()}
              >
                Join
              </button>
            </form>
          </div>

          {/* Right Column: Premium Active Video Call Mock Graphic */}
          <div className={`col-lg-6 ${styles.rightCol}`}>
            <div className={styles.collageContainer}>
              
              {/* Card 1: Main (Mother and Kids) */}
              <div className={`${styles.videoCard} ${styles.cardMain}`}>
                <div className={styles.nameTag}>Camila Rodriguez</div>
                <div className={`${styles.micIndicator} ${styles.micIndicatorMuted}`}>
                  <i className="fa-solid fa-microphone-slash" style={{ fontSize: '10px' }}></i>
                </div>
              </div>

              {/* Card 2: Overlay Top Right (Smiling Man) */}
              <div className={`${styles.videoCard} ${styles.cardOver1}`}>
                <div className={styles.nameTag}>Stephen Turner</div>
                <div className={styles.micIndicator}>
                  <i className="fa-solid fa-microphone" style={{ fontSize: '10px' }}></i>
                </div>
              </div>

              {/* Card 3: Overlay Bottom Right (Young Woman) */}
              <div className={`${styles.videoCard} ${styles.cardOver2}`}>
                <div className={styles.nameTag}>Camila R.</div>
                <div className={styles.micIndicator}>
                  <i className="fa-solid fa-microphone" style={{ fontSize: '10px' }}></i>
                </div>
              </div>

              {/* Control Buttons Mock Overlay */}
              <div className={styles.controlMock}>
                <div className={styles.controlBtn}><i className="fa-solid fa-microphone"></i></div>
                <div className={styles.controlBtn}><i className="fa-solid fa-video"></i></div>
                <div className={styles.controlBtn}><i className="fa-solid fa-hand"></i></div>
                <div className={styles.controlBtn}><i className="fa-solid fa-arrow-up-from-bracket"></i></div>
                <div className={`${styles.controlBtn} ${styles.controlBtnDanger}`}><i className="fa-solid fa-phone-slash"></i></div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
