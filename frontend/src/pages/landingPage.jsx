import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import './LandingPage.css'; // Custom styles (optional)
import styles from '../style/landingPage.module.css';
function LandingPage() {
  const registerRef = useRef();
  const loginRef = useRef();

  useEffect(() => {
    registerRef.current.style.color = 'white';
    loginRef.current.style.color = 'white';
  }, []);

  const navigate = useNavigate();

  return (
    <>
      <div className={styles.landingPageContainer}>
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
          <div className="container">
            <Link className="navbar-brand" to="/">Video Call</Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <p
                    className="nav-link"
                    onClick={() => navigate('/home')}
                    style={{ cursor: 'pointer' }}
                  >
                    Join as Guest
                  </p>
                </li>
                <li className="nav-item">
                  <Link
                    to="/auth"
                    className="nav-link"
                    ref={registerRef}
                  >
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/auth"
                    className="nav-link"
                    ref={loginRef}
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container my-5">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <h1>
                <span className="text-warning">Connect</span> with your loved ones
              </h1>
              <p>Cover distance by Video call</p>
              <Link to="/home">
                <button className="btn btn-primary btn-lg">Get Started</button>
              </Link>
            </div>
            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <img
                src="/VideoCalls.webp"
                className="img-fluid rounded w-75"
                alt="main-visual"
              />
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}

export default LandingPage;
