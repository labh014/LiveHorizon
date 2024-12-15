import React, { useContext, useState } from 'react';
import Auth from '../../utils/Auth';
import styles from '../../style/homePage.module.css'; // Import the CSS module
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { AuthContext } from '../../contexts/AuthContext';
import Navbar from '../../Components/Navbar';

function Home() {
  let navigate = useNavigate();
  let [meetingCode, setMeetingCode] = useState("");
  const { addToHistory } = useContext(AuthContext);

  let handleJoin = async () => {
    await addToHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className="row align-items-center">
          {/* Left Column */}
          <div className={`col-lg-6 col-md-12 ${styles.leftColumn}`}>
            <div className={styles.inputWrapper}>
              <TextField
                id="meeting-code-input"
                label="Enter Meeting Code"
                variant="filled"
                fullWidth
                onChange={(e) => setMeetingCode(e.target.value)}
              />
            </div>
            <Button variant="contained" color="primary" onClick={handleJoin}>
              Join
            </Button>
          </div>

          {/* Right Column */}
          <div className={`col-lg-6 col-md-12 ${styles.rightColumn}`}>
            <img
              src="/undraw_undraw_computer_apps_9ssq_(2)_hyf7.png"
              alt="home"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth(Home);
