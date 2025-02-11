import io from "socket.io-client";
import { toast } from "react-toastify";

// Create a singleton socket instance
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"], // Remove polling, use only websocket
      autoConnect: true,
      reconnection: true,
    });

    // Add socket event listeners for connection status
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      // Join personal room on connection
      const currentUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("emp_user"));

      if (currentUser?._id) {
        socket.emit("join_rooms", {
          userId: currentUser._id,
          userType: currentUser.role || "user",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Add WebRTC related socket events with more detailed logging
    socket.on("incoming-call", (data) => {
      console.log("Incoming call received in socket:", data);
      window.dispatchEvent(
        new CustomEvent("incoming-call", {
          detail: data,
        })
      );
    });

    socket.on("call-accepted", (data) => {
      console.log("Call accepted:", data);
    });

    socket.on("call-rejected", (data) => {
      console.log("Call rejected:", data);
    });

    socket.on("call-ended", () => {
      console.log("Call ended");
    });

    // Add error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Add reconnection handler
    socket.on("reconnect", () => {
      console.log("Socket reconnected, rejoining rooms");
      const currentUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("emp_user"));

      if (currentUser?._id) {
        socket.emit("join_rooms", {
          userId: currentUser._id,
          userType: currentUser.role || "user",
        });
      }
    });
  }

  return socket;
};

export default getSocket();
