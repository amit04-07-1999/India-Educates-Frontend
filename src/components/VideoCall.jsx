import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { toast } from "react-toastify";
import "./VideoCall.css";
import CallInvitation from "./CallInvitation";

const VideoCall = ({
  isOpen,
  onClose,
  callerId,
  receiverId,
  isIncoming = false,
  callerName = "",
  callRoom = null,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [showInvitation, setShowInvitation] = useState(isIncoming);
  const [callAccepted, setCallAccepted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    console.log("VideoCall component opened with props:", {
      callerId,
      receiverId,
      isIncoming,
      callRoom,
      callerName,
      socketId: socket.id,
    });

    // Set initial states based on incoming status
    setShowInvitation(isIncoming);
    setCallAccepted(!isIncoming);

    const configuration = {
      iceServers: [
        {
          urls: "stun:stun1.l.google.com:19302",
        },
        {
          urls: ["turn:a.relay.metered.ca:80", "turn:a.relay.metered.ca:443"],
          username: "1513dcc64bc1159ec713ad8e",
          credential: "3951a658d14039fde916a9e6d8eece897f7c",
        },
      ],
    };

    const setupCall = async () => {
      try {
        console.log(`Setting up call in room: ${callRoom}`);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
          console.log("Received remote track:", event.track.kind);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current
              .play()
              .catch((e) => console.error("Error playing remote video:", e));
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log(
            "Connection state changed:",
            peerConnection.connectionState
          );
          if (peerConnection.connectionState === "failed") {
            console.log("Connection failed, cleaning up");
            cleanup();
            onClose();
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          console.log(
            "ICE connection state:",
            peerConnection.iceConnectionState
          );
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate");
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              receiverId: isIncoming ? callerId : receiverId,
            });
          }
        };

        // If initiator, create and send offer
        if (!isIncoming) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit("call-offer", {
            offer,
            receiverId,
          });
        }
      } catch (err) {
        console.error("Error setting up call:", err);
        toast.error("Failed to setup call");
        cleanup();
        onClose();
      }
    };

    // Socket event handlers
    socket.on("call-offer", async ({ offer }) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("call-answer", {
          answer,
          callerId,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
        toast.error("Failed to handle call offer");
        cleanup();
      }
    });

    socket.on("call-answer", async ({ answer }) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Error handling answer:", err);
        toast.error("Failed to handle call answer");
        cleanup();
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("call-accepted", async (data) => {
      try {
        if (callRoom) {
          console.log("Call accepted in room:", callRoom);
          setCallAccepted(true);
          await setupCall();
        }
      } catch (err) {
        console.error("Error handling call acceptance:", err);
        cleanup();
      }
    });

    socket.on("call-rejected", () => {
      console.log("Call rejected in room:", callRoom);
      toast.info("Call was declined");
      cleanup();
      onClose();
    });

    socket.on("call-ended", () => {
      console.log("Call ended in room:", callRoom);
      toast.info("Call ended");
      cleanup();
      onClose();
    });

    // If not incoming call, start the call
    if (!isIncoming) {
      console.log(`Initiating outgoing call in room: ${callRoom}`);
      setupCall();
    }

    return () => {
      console.log(`Cleaning up call in room: ${callRoom}`);
      cleanup();
      socket.off("call-offer");
      socket.off("call-answer");
      socket.off("ice-candidate");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [isOpen, callerId, receiverId, isIncoming, callRoom, onClose]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    localStreamRef.current = null;
    peerConnectionRef.current = null;
  };

  const handleEndCall = () => {
    socket.emit("end-call", {
      callerId,
      receiverId,
      callRoom,
    });
    cleanup();
    onClose();
  };

  // Handle call acceptance
  const handleAcceptCall = async () => {
    try {
      setShowInvitation(false);
      setCallAccepted(true);

      console.log("Accepting call with data:", {
        callerId,
        receiverId,
        callRoom,
        socketId: socket.id,
      });

      socket.emit("call-accepted", {
        callerId,
        receiverId,
        callRoom,
      });

      await setupCall();
    } catch (err) {
      console.error("Error accepting call:", err);
      cleanup();
      onClose();
    }
  };

  // Handle call decline
  const handleDeclineCall = () => {
    socket.emit("call-rejected", {
      callerId,
      receiverId,
      callRoom,
    });
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  // Show invitation UI for incoming calls
  if (isIncoming && showInvitation) {
    console.log("Showing invitation UI for caller:", callerName);
    return (
      <CallInvitation
        callerName={callerName}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    );
  }

  // Show video call UI only after call is accepted
  if (!callAccepted) return null;

  return (
    <div className={`video-call-container ${isOpen ? "open" : ""}`}>
      <div className="video-grid">
        <div className="remote-video-wrapper">
          <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
          />
          {!remoteVideoRef.current?.srcObject && (
            <div className="connecting-message">Connecting...</div>
          )}
        </div>
        <div className="local-video-wrapper">
          <video
            ref={localVideoRef}
            className="local-video"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>
      <div className="controls">
        <button className="end-call-btn" onClick={handleEndCall}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
