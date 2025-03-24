import React, { useState, useEffect } from 'react';

const CallHistory = () => {
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {

    const history = [
      { id: 1, number: '123-456-7890', type: 'outgoing', date: '2024-02-07' },
      { id: 2, number: '098-765-4321', type: 'incoming', date: '2024-02-06' },
  
    ];

    setCallHistory(history);
  }, []);

  return (
    <div className="call-history">
      <h3>Call History</h3>
      {callHistory.map((call) => (
        <div key={call.id} className="call-history-item">
          <div>Number: {call.number}</div>
          <div>Type: {call.type}</div>
          <div>Date: {call.date}</div>
        </div>
      ))}
    </div>
  );
};

export default CallHistory;
