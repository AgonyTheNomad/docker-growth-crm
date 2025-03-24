import React, { useState, useEffect } from 'react';
import Keypad from '../../components/ZoomPhone/Keypad';
import DialButton from '../../components/ZoomPhone/DialButton';

const PhoneInterfaceComponent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('Ready to call');
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleNumberInput = (number) => {
    setPhoneNumber((prevPhoneNumber) => prevPhoneNumber + number);
  };

  const handleCall = async () => {
    if (!accessToken) {
      setCallStatus('Please log in to make a call');
      return;
    }

    setCallStatus('Calling...');
    try {
      const response = await fetch('http://localhost:3002/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      
      const data = await response.json();
      setCallStatus(`Call made successfully: ${data.message}`);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setCallStatus('Call failed');
    }
  };

  const handleEndCall = () => {
    setPhoneNumber('');
    setCallStatus('Ready to call');
  };

  return (
    <div className="phone-interface">
      <Keypad onNumberInput={handleNumberInput} />
      <DialButton onCall={handleCall} disabled={!accessToken || phoneNumber.length === 0} />
      <div>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
        />
        <button onClick={handleEndCall}>End Call</button>
      </div>
      <div>Status: {callStatus}</div>
    </div>
  );
};

export default PhoneInterfaceComponent;