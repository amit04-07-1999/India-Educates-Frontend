import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";
import ChatLayout from "./ChatLayout";
import Sidebar from "../components/Sidebar";
// import Header from "../components/Header";
import FilePreview from "./FilePreview";
import VideoCall from "../components/VideoCall";
import { BsCameraVideoFill } from "react-icons/bs";
import socket from "../socket";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const fetchUsers = async () => {
    try {
      const [employeeResponse, clientResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`),
      ]);

      console.log("Employee Response:", employeeResponse.data);
      console.log("Client Response:", clientResponse.data);

      const mappedEmployees = employeeResponse.data
        .filter((emp) => emp && emp._id)
        .map((emp) => ({
          _id: emp._id,
          employeeName: emp.employeeName || emp.name,
          emailid: emp.emailid || emp.email,
          phone: emp.phone,
          employeeImage: emp.employeeImage || emp.profileImage,
          role: "employee",
        }));

      const mappedClients = clientResponse.data
        .filter((client) => client && client._id)
        .map((client) => ({
          _id: client._id,
          clientName: client.clientName || client.name,
          clientEmail: client.clientEmail || client.email,
          clientPhone: client.clientPhone || client.phone,
          clientImage: client.clientImage || client.profileImage,
          role: "client",
        }));

      console.log("Mapped Employees:", mappedEmployees);
      console.log("Mapped Clients:", mappedClients);

      setEmployees(mappedEmployees);
      setClients(mappedClients);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/groups`
      );
      const userGroups = response.data.filter((group) =>
        group.members.some(
          (member) => member.userId === currentUser._id && !member.isRemoved
        )
      );
      setGroups(userGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Error loading groups");
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChats/${
          currentUser._id
        }/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error loading messages");
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getGroupMessages/${groupId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error("Error loading group messages");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/notifications/${currentUser._id}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("emp_user"));

    if (currentUser) {
      // Join room for receiving calls
      socket.emit("join_room", currentUser._id);
      console.log("Joining room:", currentUser._id);

      // Listen for incoming calls using window event
      const handleIncomingCall = (event) => {
        const data = event.detail;
        console.log("Incoming call received in Chat:", data);
        setIsCallActive(true);
        setIncomingCallData(data);
        toast.info(`Incoming call from ${data.callerName}`, {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        });
      };

      window.addEventListener("incoming-call", handleIncomingCall);

      return () => {
        socket.off("incoming-call");
        window.removeEventListener("incoming-call", handleIncomingCall);
      };
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (user, userType) => {
    const mappedUser = {
      _id: user._id,
      name: userType === "Employee" ? user.employeeName : user.clientName,
      userType: userType,
      email: userType === "Employee" ? user.emailid : user.clientEmail,
      phone: userType === "Employee" ? user.phone : user.clientPhone,
      image: userType === "Employee" ? user.employeeImage : user.clientImage,
    };

    setSelectedUser(mappedUser);
    markNotificationsAsRead(user._id);

    if (userType === "Group") {
      fetchGroupMessages(user._id);
    } else {
      fetchMessages(user._id);
      fetchChatSettings(user._id);
    }
  };

  const mapRoleToType = (role) => {
    switch (role.toLowerCase()) {
      case "employee":
        return "Employee";
      case "client":
        return "Client";
      default:
        return "Employee";
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        senderId: currentUser._id,
        senderType: "AdminUser",
        senderName: currentUser.username,
        senderImage: currentUser.profileImage,
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: newMessage,
      };

      console.log("Admin sending message:", messageData);

      setNewMessage("");

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        messageData
      );

      if (selectedUser.userType === "Group") {
        const groupMessageData = {
          ...response.data,
          groupId: selectedUser._id,
          members: selectedUser.members,
          senderDetails: {
            name: currentUser.username,
            email: currentUser.email,
            image: currentUser.profileImage,
            type: "AdminUser",
          },
        };

        console.log("Emitting group message:", groupMessageData);
        socket.emit("group_message", groupMessageData);
      } else {
        socket.emit("private_message", {
          receiverId: selectedUser._id,
          message: response.data,
        });
      }

      // setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderUserItem = (user, selectedUser, onUserSelect) => {
    if (!user || !user._id) return null;

    const isEmployee = activeTab === "employees";
    const userNotifications = notifications.filter(
      (n) => n.senderId === user._id
    ).length;

    const imagePath = isEmployee ? user.employeeImage : user.clientImage;
    const imageUrl = imagePath
      ? `${import.meta.env.VITE_BASE_URL}${imagePath.replace("uploads/", "")}`
      : "default-avatar.avif";

    const userName = isEmployee
      ? user.employeeName || "Unknown Employee"
      : user.clientName || "Unknown Client";

    const contactInfo = isEmployee
      ? user.phone || user.emailid || "No contact info"
      : user.clientPhone || user.clientEmail || "No contact info";

    return (
      <li
        key={user._id}
        className={`list-group-item ${
          selectedUser?._id === user._id ? "active" : ""
        }`}
        style={{
          backgroundColor: selectedUser?._id === user._id ? "#80808069" : "",
          cursor: "pointer",
        }}
        onClick={() => onUserSelect(user, isEmployee ? "Employee" : "Client")}
      >
        <div className="d-flex align-items-center">
          <div className="position-relative">
            <img
              src={imageUrl}
              className="avatar rounded-circle"
              style={{
                objectFit: "cover",
                width: "40px",
                height: "40px",
              }}
              alt={userName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "default-avatar.avif";
              }}
            />
            {userNotifications > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {userNotifications}
              </span>
            )}
          </div>
          <div className="flex-fill ms-3">
            <h6 className="mb-0 fw-semibold" style={{ fontSize: "14px" }}>
              {userName}
            </h6>
            <small className="text-muted">{contactInfo}</small>
          </div>
        </div>
      </li>
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.split("/")[0];
    if (!["image", "video", "audio"].includes(fileType)) {
      toast.error("Unsupported file type");
      return;
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleFileSend = async (file) => {
    const formData = new FormData();

    formData.append("senderId", currentUser._id);
    formData.append("senderType", mapRoleToType(currentUser.role));
    formData.append("receiverId", selectedUser._id);
    formData.append("receiverType", selectedUser.userType);
    formData.append("message", "");

    const fileType = file.type.split("/")[0];
    if (fileType === "image") {
      formData.append("images", file);
    } else if (fileType === "video") {
      formData.append("video", file);
    } else if (fileType === "audio") {
      formData.append("audio", file);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev) => [...prev, response.data]);
      socket.emit("private_message", {
        receiverId: selectedUser._id,
        message: response.data,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };

  const handleVoiceRecordingComplete = async (blob) => {
    const formData = new FormData();

    formData.append("senderId", currentUser._id);
    formData.append("senderType", mapRoleToType(currentUser.role));
    formData.append("receiverId", selectedUser._id);
    formData.append("receiverType", selectedUser.userType);
    formData.append("message", "");

    formData.append("recording", blob, "recording.webm");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev) => [...prev, response.data]);
      socket.emit("private_message", {
        receiverId: selectedUser._id,
        message: response.data,
      });
    } catch (error) {
      console.error("Error uploading recording:", error);
      toast.error("Error uploading recording");
    }
  };

  const handleMessageEdit = async (messageId, newMessage) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/updateChat/${messageId}`,
        { message: newMessage }
      );
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Error updating message");
    }
  };

  const handleMessageDelete = async (messageId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/deleteChat/${messageId}`
      );
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    }
  };

  const allUsers = [...employees, ...clients].filter(Boolean);

  useEffect(() => {
    if (!selectedUser) return;

    // Initial fetch of messages
    if (selectedUser.userType === "Group") {
      fetchGroupMessages(selectedUser._id);
    } else {
      fetchMessages(selectedUser._id);
    }

    // Listen for new messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        if (!prev.some((m) => m._id === message._id)) {
          if (
            selectedUser?.userType === "Group" &&
            message.receiverId === selectedUser._id
          ) {
            return [...prev, message];
          } else if (
            message.senderId === selectedUser._id ||
            message.receiverId === selectedUser._id
          ) {
            return [...prev, message];
          }
        }
        return prev;
      });
    });

    // Listen for group messages
    socket.on("receive_group_message", (message) => {
      setMessages((prev) => {
        if (
          !prev.some((m) => m._id === message._id) &&
          selectedUser?.userType === "Group" &&
          message.receiverId === selectedUser._id
        ) {
          return [...prev, message];
        }
        return prev;
      });
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_group_message");
    };
  }, [selectedUser]);

  const fetchChatSettings = async (otherUserId) => {
    try {
      // Only fetch if we have valid IDs
      if (!currentUser?._id || !otherUserId) {
        console.log("Missing user IDs for chat settings");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChatSettings/${
          currentUser._id
        }/${otherUserId}`
      );
      // Handle the settings...
    } catch (error) {
      console.error("Error fetching chat settings:", error);
    }
  };

  const markNotificationsAsRead = async (senderId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/markNotificationsRead`,
        {
          userId: currentUser._id,
          senderId,
        }
      );
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleStartCall = () => {
    if (!selectedUser) return;

    console.log("Starting call to:", selectedUser);

    socket.emit("call-user", {
      callerId: currentUser._id,
      receiverId: selectedUser._id,
      callerName:
        currentUser.username || currentUser.employeeName || currentUser.name,
      type: "video",
    });

    setIsCallActive(true);
  };

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          {/* <Header /> */}
          <div className="body d-flex py-lg-3 py-md-2">
            <ChatLayout
              users={
                activeTab === "groups"
                  ? allUsers
                  : activeTab === "admins"
                  ? admins
                  : activeTab === "employees"
                  ? employees
                  : clients
              }
              groups={groups}
              socket={socket}
              selectedUser={selectedUser}
              messages={messages.map((msg) => ({
                ...msg,
                isCurrentUser: msg.senderId === currentUser._id,
              }))}
              newMessage={newMessage}
              activeTab={activeTab}
              tabs={[
                { id: "employees", label: "Agents" },
                { id: "clients", label: "Associates" },
                { id: "groups", label: "Groups" },
              ]}
              onTabChange={setActiveTab}
              onUserSelect={handleUserSelect}
              onMessageChange={(e) => setNewMessage(e.target.value)}
              onMessageSubmit={sendMessage}
              messagesEndRef={messagesEndRef}
              renderUserItem={renderUserItem}
              onFileUpload={handleFileUpload}
              onVoiceRecordingComplete={handleVoiceRecordingComplete}
              onMessageEdit={handleMessageEdit}
              onMessageDelete={handleMessageDelete}
              fetchMessages={fetchMessages}
              setSelectedUser={setSelectedUser}
              fetchChatSettings={fetchChatSettings}
            >
              {selectedUser && selectedUser.userType !== "Group" && (
                <button
                  className="video-call-btn"
                  onClick={handleStartCall}
                  title="Start Video Call"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: "1.2rem",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <BsCameraVideoFill />
                </button>
              )}
            </ChatLayout>
            <FilePreview
              show={showFilePreview}
              onHide={() => {
                setShowFilePreview(false);
                setSelectedFile(null);
              }}
              file={selectedFile}
              onSend={handleFileSend}
            />
          </div>
        </div>
      </div>
      <VideoCall
        isOpen={isCallActive}
        onClose={() => {
          setIsCallActive(false);
          setIncomingCallData(null);
        }}
        callerId={incomingCallData?.callerId || currentUser._id}
        receiverId={incomingCallData?.callerId || selectedUser?._id}
        isIncoming={!!incomingCallData}
        callerName={
          incomingCallData?.callerName ||
          currentUser.username ||
          currentUser.employeeName ||
          currentUser.name
        }
        callRoom={incomingCallData?.callRoom}
      />
    </>
  );
};

export default Chat;
