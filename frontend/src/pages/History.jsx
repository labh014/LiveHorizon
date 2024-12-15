import React, { useEffect, useState, useContext } from 'react';
import styles from '../style/historyPage.module.css'
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Auth from '../utils/Auth';

function History() {
  const { getHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const fetchHistory = async () => {
        const history = await getHistory();
        setMeetings(history);
      };
      fetchHistory();
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="row g-2"> {/* Adjusted spacing between columns */}
          {meetings.map((event, index) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={index}>
              <div className={`${styles.card} card`} style={{ width: "18rem" }}>
                <div className="card-header">History Update</div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">Meeting ID: {event.meetingCode}</li>
                  <li className="list-group-item">Date: {event.date}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Auth(History);
