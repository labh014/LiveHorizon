import React, { useEffect, useState, useContext } from 'react';
import styles from '../style/historyPage.module.css'
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  if (!meetings || meetings.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h4 className="mb-2">No history yet</h4>
        <p className="text-muted">Join a meeting and it will appear here.</p>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    )
  }

  return (
    <>
      <div className="container my-4">
        <div className="row g-2">
          {meetings.map((event, index) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={index}>
              <div className={`${styles.card} card`} style={{ width: "18rem" }}>
                <div className="card-header">History Update</div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">Meeting ID: {event.meetingCode}</li>
                  <li className="list-group-item">Date: {new Date(event.date).toLocaleString()}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default History;
