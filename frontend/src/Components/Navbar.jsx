import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { Button } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';
import Avatar from '@mui/material/Avatar';
import server from '../../environment.js';

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { userData } = useContext(AuthContext);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-light border-bottom sticky-top w-100">
        <div className="container-fluid">
          {/* Brand Icon */}
          <a className="navbar-brand" href="/">
            <i className="fa-solid fa-compass"></i>
          </a>

          {/* Navbar Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content */}
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              {/* Home Link */}
              <a className="nav-link cursor-pointer">
                <div className="company_name">
                  <b>
                    <i onClick={() => navigate("/home")}>Video Call and Chat</i>
                  </b>
                </div>
              </a>
            </div>

            {/* Right-aligned Items */}
            <div className="ms-auto d-flex align-items-center navbar-nav">
              <div className="dropdown">
                <button className="btn btn-light d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <Avatar src={userData?.avatarUrl ? (userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `${server}${userData.avatarUrl}`) : ''} sx={{ width: 32, height: 32 }} />
                  <span className="ms-2 d-none d-sm-inline" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userData?.name || 'Profile'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li className="px-3 py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <Avatar src={userData?.avatarUrl ? (userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `${server}${userData.avatarUrl}`) : ''} sx={{ width: 32, height: 32 }} />
                      <div className="ms-2" style={{ minWidth: 140 }}>
                        <div style={{ fontWeight: 600, lineHeight: 1 }}>{userData?.name || 'User'}</div>
                        <div style={{ fontSize: 12, color: '#6c757d' }}>{userData?.username}</div>
                      </div>
                    </div>
                  </li>
                  <li><button className="dropdown-item" onClick={() => navigate('/profile')}>Profile</button></li>
                  <li><button className="dropdown-item" onClick={() => navigate('/history')}>History</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={logout}>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
