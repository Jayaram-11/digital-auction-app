// src/components/AuctionTimer.jsx

import React, { useState, useEffect } from 'react';

const AuctionTimer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval !== 'seconds' && interval !== 'minutes') {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {String(timeLeft[interval]).padStart(2, '0')}
        {interval.charAt(0)}{' '}
      </span>
    );
  });

  return (
    <div className="timer">
      {timerComponents.length ? timerComponents : <span>Auction Ended!</span>}
    </div>
  );
};

export default AuctionTimer;