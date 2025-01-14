import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ meetingDate, meetingTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Create date objects for meeting time and current time
        const meetingDateTime = new Date(meetingDate);
        meetingDateTime.setHours(...meetingTime.split(':'));
        const now = new Date();

        // Calculate the time difference in milliseconds
        const difference = meetingDateTime - now;

        // Move this check to the top and return immediately if difference is negative
        if (difference <= 0) {
          return 'Meeting time passed';
        }

        // Only calculate time components if meeting is in future
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format the output string only if all calculations are valid
        if (isNaN(days) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
          return 'Meeting time passed';
        }

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        return timeString;

      } catch (error) {
        console.error('Error in calculateTimeLeft:', error);
        console.error('Meeting Date:', meetingDate);
        console.error('Meeting Time:', meetingTime);
        return 'Error calculating time';
      }
    };

    // Update the component every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [meetingDate, meetingTime]);

  return (
    <span className="badge bg-primary text-light ms-2">
      {timeLeft}
    </span>
  );
};

export default CountdownTimer; 