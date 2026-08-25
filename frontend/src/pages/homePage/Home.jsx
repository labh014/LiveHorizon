import React, { useContext, useState, useEffect } from 'react';
import styles from '../../style/homePage.module.css';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const { userData, addToHistory } = useContext(AuthContext);
  const [meetingCode, setMeetingCode] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Digital Clock States
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Carousel Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  // Update Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Clock format: hh:mm:ss AM/PM
      const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
      setTimeStr(now.toLocaleTimeString('en-US', timeOptions));

      // Date format: Mon, Jul 13, 2026
      const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', dateOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Carousel Auto-Slide
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Generate Google-Meet style code: xxx-xxxx-xxx
  const generateMeetingCode = () => {
    const part1 = Math.random().toString(36).substring(2, 5);
    const part2 = Math.random().toString(36).substring(2, 6);
    const part3 = Math.random().toString(36).substring(2, 5);
    return `${part1}-${part2}-${part3}`;
  };

  const handleStartInstantMeeting = async () => {
    const code = generateMeetingCode();
    await addToHistory(code);
    navigate(`/${code}`);
  };

  const handleCreateMeetingLater = () => {
    const code = generateMeetingCode();
    const link = `${window.location.origin}/${code}`;
    setGeneratedLink(link);
    setShowDropdown(false);
    setShowPopover(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      // Extract raw code if they enter a full URL
      let cleanCode = meetingCode.trim();
      if (cleanCode.includes('/')) {
        cleanCode = cleanCode.substring(cleanCode.lastIndexOf('/') + 1);
      }
      await addToHistory(cleanCode);
      navigate(`/${cleanCode}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const closeMenu = () => setShowDropdown(false);
    if (showDropdown) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [showDropdown]);

  // Slides Details
  const slides = [
    {
      title: "Get a link you can share",
      text: "Click New meeting to get a link you can send to people you want to meet with",
      svg: (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#e8f0fe" />
          <path d="M35 50C35 44.48 39.48 40 45 40H55C60.52 40 65 44.48 65 50C65 55.52 60.52 60 55 60H45C39.48 60 35 55.52 35 50Z" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 50H58" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="50" r="3" fill="#1a73e8" />
          <circle cx="55" cy="50" r="3" fill="#1a73e8" />
        </svg>
      )
    },
    {
      title: "Plan ahead",
      text: "Instantly create meeting links and copy them to send invitations to participants",
      svg: (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#e6f4ea" />
          <rect x="35" y="38" width="30" height="26" rx="3" stroke="#34a853" strokeWidth="3" />
          <line x1="35" y1="46" x2="65" y2="46" stroke="#34a853" strokeWidth="3" />
          <path d="M42 32V38" stroke="#34a853" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 32V38" stroke="#34a853" strokeWidth="3" strokeLinecap="round" />
          <circle cx="43" cy="54" r="2.5" fill="#34a853" />
          <circle cx="50" cy="54" r="2.5" fill="#34a853" />
          <circle cx="57" cy="54" r="2.5" fill="#34a853" />
        </svg>
      )
    },
    {
      title: "Your meeting is safe",
      text: "No one can join a meeting unless they have the matching secure room code",
      svg: (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#fef7e0" />
          <path d="M50 32C50 32 38 36 38 46V56C38 62.6 44 68 50 70C56 68 62 62.6 62 56V46C62 36 50 32 50 32Z" stroke="#fbbc04" strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 51L49 54L55 47" stroke="#fbbc04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className="row align-items-center g-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Left Column: Greeting, Instant Actions & Form */}
        <div className={`col-lg-6 ${styles.leftColumn}`}>
          <h1 className={styles.welcomeTitle}>
            Premium video meetings.<br />
            Now free for everyone.
          </h1>
          <p className={styles.welcomeSubtitle}>
            Welcome back, <strong>{userData?.name || 'User'}</strong>. Create secure calls or join in instantly.
          </p>

          <div className={styles.actionGroup}>
            {/* New Meeting Button */}
            <button 
              className={styles.btnNewMeeting} 
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              New meeting
            </button>

            {/* Dropdown Options */}
            {showDropdown && (
              <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                <button className={styles.dropdownItem} onClick={handleCreateMeetingLater}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Create a meeting for later
                </button>
                <button className={styles.dropdownItem} onClick={handleStartInstantMeeting}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Start an instant meeting
                </button>
              </div>
            )}

            {/* Enter Code / Link Input Inline */}
            <form onSubmit={handleJoin} className={styles.joinGroup}>
              <div className={styles.inputWrapper}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.inputIcon}>
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                  <line x1="6" y1="8" x2="6" y2="8"></line>
                  <line x1="10" y1="8" x2="10" y2="8"></line>
                  <line x1="14" y1="8" x2="14" y2="8"></line>
                  <line x1="18" y1="8" x2="18" y2="8"></line>
                  <line x1="6" y1="12" x2="6" y2="12"></line>
                  <line x1="10" y1="12" x2="10" y2="12"></line>
                  <line x1="14" y1="12" x2="14" y2="12"></line>
                  <line x1="18" y1="12" x2="18" y2="12"></line>
                  <line x1="7" y1="16" x2="17" y2="16"></line>
                </svg>
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
        </div>

        {/* Right Column: Clock & Rotating Features Promo Card */}
        <div className={`col-lg-6 ${styles.rightColumn}`}>
          <div className={styles.cardPromo}>
            
            {/* Real-time Digital Clock Header */}
            <div className={styles.timeDisplay}>
              <div className={styles.digitalClock}>{timeStr}</div>
              <div className={styles.dateText}>{dateStr}</div>
            </div>

            {/* Dynamic Slides */}
            <div className={styles.slideContent}>
              <div className={styles.slideImg}>
                {slides[activeSlide].svg}
              </div>
              <div className={styles.slideTitle}>
                {slides[activeSlide].title}
              </div>
              <div className={styles.slideText}>
                {slides[activeSlide].text}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className={styles.carouselDots}>
              {slides.map((_, index) => (
                <div 
                  key={index} 
                  className={`${styles.dot} ${activeSlide === index ? styles.dotActive : ''}`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Copy Link Popover Overlay Card */}
      {showPopover && (
        <div className={styles.popoverOverlay}>
          <div className={styles.popoverCard}>
            <div className={styles.popoverHeader}>
              <h5>Here's the link to your meeting</h5>
              <button className={styles.popoverClose} onClick={() => setShowPopover(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
              Copy this link and send it to people you want to meet with. Make sure you save it so you can use it later.
            </p>
            <div className={styles.popoverCopyBar}>
              <span className={styles.popoverLinkText}>{generatedLink}</span>
              <button 
                className={styles.btnCopy} 
                onClick={handleCopyLink}
                title="Copy meeting link"
              >
                {copied ? (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#34a853' }}>Copied!</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
