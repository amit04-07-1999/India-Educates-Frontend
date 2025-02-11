import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";
import ChatLayout from "./ChatLayout";
import Sidebar from "../employeeCompt/EmployeeSidebar";
// import Header from "../employeeCompt/EmployeeHeader";
import FilePreview from "./FilePreview";
import VideoCall from "../components/VideoCall";
import { BsCameraVideoFill } from "react-icons/bs";
import socket from "../socket";

const EmployeeChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [admins, setAdmins] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("admins");
  const messagesEndRef = useRef(null);
  const currentEmployee = JSON.parse(localStorage.getItem("emp_user"));
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASE_URL);

    if (socket.current) {
      socket.current.emit("join_chat", currentEmployee._id);
      socket.current.emit("join_notifications", currentEmployee._id);

      const currentUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("emp_user")) ||
        JSON.parse(localStorage.getItem("client_user"));

      socket.current.emit("user_connected", {
        userId: currentUser._id,
        userType:
          currentUser.role === "admin"
            ? "AdminUser"
            : currentUser.role === "employee"
            ? "Employee"
            : "Client",
      });

      // Add this new listener for group updates
      socket.current.on("group_updated", (updatedGroup) => {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === updatedGroup._id ? updatedGroup : group
          )
        );
      });

      // Listen for received messages
      socket.current.on("receive_message", (message) => {
        setMessages((prev) => {
          if (!prev.some((m) => m._id === message._id)) {
            if (
              selectedUser?.userType === "Group" &&
              message.receiverId === selectedUser._id
            ) {
              return [...prev, message];
            } else if (
              selectedUser &&
              (message.senderId === selectedUser._id ||
                message.receiverId === selectedUser._id)
            ) {
              return [...prev, message];
            }
          }
          return prev;
        });
      });

      // Listen for sent message confirmations
      socket.current.on("message_sent", (message) => {
        setMessages((prev) => {
          if (!prev.some((m) => m._id === message._id)) {
            return [...prev, message];
          }
          return prev;
        });
      });

      // Listen for message updates
      socket.current.on("message_updated", (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      // Listen for message deletions
      socket.current.on("message_deleted", (deletedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
      });

      // Listen for group messages
      socket.current.on("receive_group_message", (message) => {
        console.log("Employee received group message:", message); // Debug log
        setMessages((prev) => {
          if (!prev.some((m) => m._id === message._id)) {
            if (
              selectedUser?.userType === "Group" &&
              message.receiverId === selectedUser._id
            ) {
              console.log("Adding new group message to state"); // Debug log
              return [...prev, message];
            }
          }
          return prev;
        });
      });

      socket.current.on("group_message_sent", (message) => {
        console.log("Group message sent confirmation:", message); // Debug log
        setMessages((prev) => {
          if (!prev.some((m) => m._id === message._id)) {
            return [...prev, message];
          }
          return prev;
        });
      });

      // Add listener for member removal
      socket.current.on("member_removed_from_group", (data) => {
        if (currentEmployee._id === data.memberId) {
          // Remove the group from the local state if current employee is removed
          setGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== data.groupId)
          );

          // If the removed group is currently selected, clear the selection
          if (selectedUser && selectedUser._id === data.groupId) {
            setSelectedUser(null);
            setMessages([]);
          }
        } else {
          // Update the group's member list in local state
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group._id === data.groupId) {
                return {
                  ...group,
                  members: group.members.map((member) => {
                    if (member.userId === data.memberId) {
                      return { ...member, isRemoved: true };
                    }
                    return member;
                  }),
                };
              }
              return group;
            })
          );
        }
      });

      socket.current.on("new_notification", (notification) => {
        setNotifications((prev) => [...prev, notification]);
        new Audio("/notification-sound.mp3")
          .play()
          .catch((e) => console.log(e));
      });

      fetchUsers();
      fetchGroups();
      fetchNotifications();

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current.off("receive_group_message");
          socket.current.off("group_message_sent");
          socket.current.off("group_updated");
          socket.current.off("receive_message");
          socket.current.off("message_sent");
          socket.current.off("message_updated");
          socket.current.off("message_deleted");
          socket.current.off("member_removed_from_group");
          socket.current.off("new_notification");
        }
      };
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const [adminResponse, clientResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}api/adminuser`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`),
      ]);
      setAdmins(adminResponse.data);
      setClients(clientResponse.data);
    } catch (error) {
      toast.error("Error loading users");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/groups`
      );
      const userGroups = response.data.filter((group) =>
        group.members.some(
          (member) => member.userId === currentEmployee._id && !member.isRemoved
        )
      );
      setGroups(userGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Error loading groups");
    }
  };

  // Add notification fetching
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/notifications/${
          currentEmployee._id
        }`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Add function to mark notifications as read
  const markNotificationsAsRead = async (senderId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/markNotificationsRead`,
        {
          userId: currentEmployee._id,
          senderId,
        }
      );
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Modify handleUserSelect
  const handleUserSelect = (user, userType) => {
    setSelectedUser({ ...user, userType });
    markNotificationsAsRead(user._id);
    if (userType === "Group") {
      fetchGroupMessages(user._id);
    } else {
      fetchMessages(user._id);
      fetchChatSettings(user._id);
    }
  };

  // Add group message fetching
  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getGroupMessages/${groupId}`
      );
      setMessages(response.data);
    } catch (error) {
      toast.error("Error loading group messages");
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChats/${
          currentEmployee._id
        }/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      toast.error("Error loading messages");
    }
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        senderId: currentEmployee._id,
        senderType: "Employee",
        senderName: currentEmployee.employeeName,
        senderImage: currentEmployee.employeeImage,
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: newMessage,
      };

      console.log("Employee sending message:", messageData); // Debug log

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
            name: currentEmployee.employeeName,
            email: currentEmployee.emailid,
            image: currentEmployee.employeeImage,
            type: "Employee",
          },
        };

        console.log("Emitting group message:", groupMessageData); // Debug log
        socket.current.emit("group_message", groupMessageData);
      } else {
        socket.current.emit("private_message", {
          receiverId: selectedUser._id,
          message: response.data,
        });
      }

      // Add message locally immediately
      // setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type.split("/")[0];
    if (!["image", "video", "audio"].includes(fileType)) {
      toast.error("Unsupported file type");
      return;
    }

    // Validate file size (15MB)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size should be less than 15MB");
      return;
    }

    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleFileSend = async (file) => {
    const formData = new FormData();

    formData.append("senderId", currentEmployee._id);
    formData.append("senderType", "Employee");
    formData.append("receiverId", selectedUser._id);
    formData.append("receiverType", selectedUser.userType);
    formData.append("message", "");

    // Determine file type and append with correct field name
    const fileType = file.type.split("/")[0];
    if (fileType === "image") {
      formData.append("images", file); // Changed from 'image' to 'images'
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
      socket.current.emit("private_message", {
        receiverId: selectedUser._id,
        message: response.data,
      });

      // Close the preview after successful upload
      setShowFilePreview(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };

  const handleVoiceRecordingComplete = async (blob) => {
    const formData = new FormData();

    // Add message data
    formData.append("senderId", currentEmployee._id);
    formData.append("senderType", "Employee");
    formData.append("receiverId", selectedUser._id);
    formData.append("receiverType", selectedUser.userType);
    formData.append("message", "");

    // Add the recording file
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
      socket.current.emit("private_message", {
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
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/updateChat/${messageId}`,
        { message: newMessage }
      );
      // Update will be handled by socket listener
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
      // Deletion will be handled by socket listener
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    }
  };

  const renderUserItem = (user, selectedUser, onUserSelect) => {
    const isAdmin = activeTab === "admins";
    const userNotifications = notifications.filter(
      (n) => n.senderId === user._id
    ).length;

    return (
      <li
        key={user._id}
        className={`list-group-item ${
          selectedUser?._id === user._id ? "active" : ""
        }`}
        style={{
          backgroundColor: selectedUser?._id === user._id ? "#80808069" : "",
        }}
        onClick={() => onUserSelect(user, isAdmin ? "AdminUser" : "Client")}
      >
        <div className="d-flex align-items-center">
          <div className="position-relative">
            <img
              src={`${import.meta.env.VITE_BASE_URL}${(isAdmin
                ? user.profileImage
                : user.clientImage
              ).replace("uploads/", "")}`}
              className="avatar rounded-circle"
              style={{ objectFit: "contain" }}
              alt={isAdmin ? user.username : user.clientName}
            />
            {userNotifications > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {userNotifications}
              </span>
            )}
          </div>
          <div className="flex-fill ms-3">
            <h6 className="mb-0 fw-semibold" style={{ fontSize: "14px" }}>
              {isAdmin ? user.username : user.clientName}
            </h6>
            <small className="">{isAdmin ? "Admin" : user.clientEmail}</small>
          </div>
        </div>
      </li>
    );
  };

  const allUsers = [...admins, ...clients].filter(Boolean);

  useEffect(() => {
    if (selectedUser?.userType === "Group") {
      const interval = setInterval(() => {
        fetchGroupMessages(selectedUser._id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchChatSettings = async (otherUserId) => {
    try {
      // Only fetch if we have valid IDs
      if (!currentEmployee?._id || !otherUserId) {
        console.log("Missing user IDs for chat settings");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChatSettings/${
          currentEmployee._id
        }/${otherUserId}`
      );
      // Handle the settings...
    } catch (error) {
      console.error("Error fetching chat settings:", error);
    }
  };

  // Add handleStartCall function
  const handleStartCall = () => {
    if (!selectedUser) {
      toast.error("Please select a user to call");
      return;
    }

    setIsCallActive(true);
    socket.current.emit("call-user", {
      callerId: currentEmployee._id,
      receiverId: selectedUser._id,
      callerName: currentEmployee.employeeName || currentEmployee.name,
    });
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
                activeTab === "admins"
                  ? admins
                  : activeTab === "clients"
                  ? clients
                  : activeTab === "groups"
                  ? allUsers
                  : groups
              }
              groups={groups}
              socket={socket.current}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              messages={messages.map((msg) => ({
                ...msg,
                isCurrentUser: msg.senderId === currentEmployee._id,
              }))}
              newMessage={newMessage}
              activeTab={activeTab}
              tabs={[
                { id: "admins", label: "Admins" },
                { id: "clients", label: "Associates" },
                { id: "groups", label: "Groups" },
              ]}
              onTabChange={setActiveTab}
              onUserSelect={handleUserSelect}
              onMessageChange={handleMessageChange}
              onMessageSubmit={handleMessageSubmit}
              onFileSend={handleFileSend}
              onVoiceRecordingComplete={handleVoiceRecordingComplete}
              messagesEndRef={messagesEndRef}
              renderUserItem={renderUserItem}
              onFileUpload={handleFileUpload}
              onMessageEdit={handleMessageEdit}
              onMessageDelete={handleMessageDelete}
              fetchMessages={fetchMessages}
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
        onClose={() => setIsCallActive(false)}
        callerId={currentEmployee._id}
        receiverId={selectedUser?._id}
        isIncoming={false}
      />
    </>
  );
};

export default EmployeeChat;
