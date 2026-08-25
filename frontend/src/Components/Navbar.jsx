import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Avatar from '@mui/material/Avatar';
import server from '../../environment.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar() {
  const navigate = useNavigate();
  const { logout, userData } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState('');

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
    const interval = setInterval(formatTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2 px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          
          {/* Logo & Brand */}
          <div 
            className="d-flex align-items-center gap-2" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate("/home")}
          >
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="8" fill="#1a73e8"/>
              <path d="M25 21V15C25 14.45 24.55 14 24 14H12C11.45 14 11 14.45 11 15V21C11 21.55 11.45 22 12 22H24C24.55 22 25 21.55 25 21ZM20 18H16V16H20V18ZM29 13L26 16V20L29 23V13Z" fill="white"/>
            </svg>
            <span style={{ fontSize: '20px', fontWeight: '500', color: '#3c4043', letterSpacing: '-0.5px' }}>
              Live<span style={{ color: '#1a73e8', fontWeight: '700' }}>Horizon</span>
            </span>
          </div>

          {/* Right Content Group: Time + User Control */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Live Clock (Hidden on extra small screens) */}
            <span className="text-muted d-none d-md-inline" style={{ fontSize: '15px', fontWeight: '400' }}>
              {currentTime}
            </span>

            {/* Dropdown User Profile */}
            {userData && (
              <div className="dropdown">
                <button 
                  className="btn btn-link p-1 d-flex align-items-center border rounded-pill px-3 py-1 gap-2 text-decoration-none hover-shadow" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ color: '#3c4043', border: '1px solid #dadce0', transition: 'box-shadow 0.2s' }}
                >
                  <Avatar 
                    src={userData?.avatarUrl ? (userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `${server}${userData.avatarUrl}`) : ''} 
                    sx={{ width: 28, height: 28 }} 
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userData?.name || 'User'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style={{ borderRadius: '12px', minWidth: '220px' }}>
                  <li className="px-3 py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <Avatar 
                        src={userData?.avatarUrl ? (userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `${server}${userData.avatarUrl}`) : ''} 
                        sx={{ width: 40, height: 40 }} 
                      />
                      <div className="overflow-hidden">
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#202124', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {userData?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5f6368', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          @{userData?.username}
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <button className="dropdown-item py-2" onClick={() => navigate('/profile')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-muted" style={{ verticalAlign: 'middle', marginTop: '-2px' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item py-2" onClick={() => navigate('/history')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-muted" style={{ verticalAlign: 'middle', marginTop: '-2px' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Meeting History
                    </button>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={logout}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: 'middle', marginTop: '-2px' }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}

export default Navbar;
