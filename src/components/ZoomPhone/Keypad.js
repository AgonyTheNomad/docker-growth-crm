import React from 'react';

const Keypad = ({ onNumberClick, onCall }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'];

  return (
    <div className="keypad">
      {numbers.map((number) => (
        <button key={number} onClick={() => onNumberClick(number)}>
          {number}
        </button>
      ))}
      <button className="call-button" onClick={onCall}>Call</button>
    </div>
  );
};

export default Keypad;
