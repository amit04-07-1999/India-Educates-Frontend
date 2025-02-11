import React, { useEffect, useState } from "react";
import io from "../socket";
import { toast } from "react-hot-toast";

const Chat = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("emp_user"));

    if (currentUser) {
      // Join user's personal room
      io.emit("join_room", currentUser._id);
      console.log("Joining room:", currentUser._id);

      // Listen for incoming calls
      io.on("incoming-call", (data) => {
        console.log("Incoming call:", data);
        setIsCallActive(true);
        // You might want to show a notification here
        toast.info(`Incoming call from ${data.callerName}`);
      });
    }

    return () => {
      io.off("incoming-call");
    };
  }, []);

  const handleStartCall = () => {
    if (!selectedUser) {
      toast.error("Please select a user to call");
      return;
    }

    console.log("Initiating call to:", selectedUser._id);
    setIsCallActive(true);

    const currentUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("emp_user"));

    io.emit("call-user", {
      callerId: currentUser._id,
      receiverId: selectedUser._id,
      callerName:
        currentUser.username || currentUser.employeeName || currentUser.name,
      type: "video",
    });
  };

  return <div>{/* Render your component content here */}</div>;
};

export default Chat;
