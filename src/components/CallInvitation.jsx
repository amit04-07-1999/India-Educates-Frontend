import React from "react";
import {
  BsCameraVideoFill,
  BsTelephoneXFill,
  BsTelephoneFill,
} from "react-icons/bs";
import "./CallInvitation.css";

const CallInvitation = ({ callerName, onAccept, onDecline }) => {
  return (
    <div className="call-invitation">
      <div className="call-invitation-content">
        <div className="caller-info">
          <div className="caller-avatar">
            <BsCameraVideoFill size={32} />
          </div>
          <h3>{callerName}</h3>
          <p>Incoming video call...</p>
        </div>
        <div className="call-actions">
          <button className="decline-btn" onClick={onDecline}>
            <BsTelephoneXFill size={24} />
            <span>Decline</span>
          </button>
          <button className="accept-btn" onClick={onAccept}>
            <BsTelephoneFill size={24} />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInvitation;
