import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { Button } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar() {
  const navigate = useNavigate();

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
              <a href="/home" className="nav-link">
                <div className="company_name">
                  <b>
                    <i>Video Call and Chat</i>
                  </b>
                </div>
              </a>
            </div>

            {/* Right-aligned Items */}
            <div className="ms-auto d-flex align-items-center navbar-nav">
              {/* History Icon and Text */}
              <div className="d-flex align-items-center nav-link">
                <IconButton onClick={() => navigate("/history")}>
                  <RestoreIcon />
                </IconButton>
                <p className="mb-0 ">
                  <b>History</b>
                </p>
              </div>

              {/* Spacer */}
              <div className="mx-3"></div>

              {/* Logout Button */}
              <Button
                variant="contained"
                style={{ borderRadius: "6px", }}
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/auth");
                  className="px-3"
                }}              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
