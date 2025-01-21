import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../studentCompt/StudentSidebar';
import ChatLayout from './ChatLayout';
import FilePreview from './FilePreview';

const StudentChat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [admins, setAdmins] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('admins');
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const currentStudent = JSON.parse(localStorage.getItem('student_user'));
    const [selectedFile, setSelectedFile] = useState(null);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [groups, setGroups] = useState([]);

    const fetchUsers = async () => {
        try {
            const [adminResponse, employeeResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BASE_URL}api/adminuser`),
                axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`)
            ]);
            setAdmins(adminResponse.data);
            setEmployees(employeeResponse.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error loading users');
        }
    };

    const fetchMessages = async (receiverId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getChats/${currentStudent._id}/${receiverId}`
            );
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Error loading messages');
        }
    };

    const fetchGroupMessages = async (groupId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getGroupMessages/${groupId}`
            );
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching group messages:', error);
            toast.error('Error loading group messages');
        }
    };

    const handleUserSelect = async (user, userType) => {
        setSelectedUser({ ...user, userType });
        if (userType === 'Group') {
            await fetchGroupMessages(user._id);
        } else {
            await fetchMessages(user._id);
            await fetchChatSettings(user._id);
        }
    };

    const handleMessageChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleMessageSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;

        try {
            const formData = new FormData();
            formData.append('senderId', currentStudent._id);
            formData.append('senderType', 'Student');
            formData.append('receiverId', selectedUser._id);
            formData.append('receiverType', selectedUser.userType);
            formData.append('message', newMessage);

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/createChat`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            setSelectedFile(null);
            setShowFilePreview(false);

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        }
    };

    const handleFileUpload = (file) => {
        setSelectedFile(file);
        setShowFilePreview(true);
    };

    const handleFileSend = async () => {
        await handleMessageSubmit({ preventDefault: () => {} });
    };

    const handleVoiceRecordingComplete = (audioBlob) => {
        const file = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
        setSelectedFile(file);
        handleFileSend();
    };

    const handleMessageEdit = async (messageId, newText) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/updateChat/${messageId}`,
                { message: newText }
            );
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? response.data : msg
            ));
        } catch (error) {
            console.error('Error editing message:', error);
            toast.error('Error editing message');
        }
    };

    const handleMessageDelete = async (messageId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/deleteChat/${messageId}`
            );
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Error deleting message');
        }
    };

    const handleClearChat = async (userId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/clearChat`, {
                userId: currentStudent._id,
                userType: 'Student',
                otherUserId: userId
            });
            setMessages([]);
            toast.success('Chat cleared successfully');
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Error clearing chat');
        }
    };

    const fetchChatSettings = async (otherUserId) => {
        try {
            if (!currentStudent?._id || !otherUserId) {
                console.log('Missing user IDs for chat settings');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getChatSettings/${currentStudent._id}/${otherUserId}`
            );
            // Handle the settings...
        } catch (error) {
            console.error('Error fetching chat settings:', error);
        }
    };

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_BASE_URL);

        if (socket.current) {
            socket.current.emit('join_chat', currentStudent._id);
            socket.current.emit('user_connected', {
                userId: currentStudent._id,
                userType: 'Student'
            });

            socket.current.on('receive_message', (message) => {
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        if (selectedUser?.userType === 'Group' && message.receiverId === selectedUser._id) {
                            return [...prev, message];
                        }
                        else if (selectedUser && 
                            (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
                            return [...prev, message];
                        }
                    }
                    return prev;
                });
            });

            // Add other socket event listeners...
            return () => {
                socket.current.disconnect();
            };
        }
    }, [selectedUser]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const renderUserItem = (user, selectedUser, onUserSelect) => {
        let userImage, userName, userType;

        // Determine user type and corresponding properties
        if (activeTab === 'admins' || user.username) {
            userImage = user.profileImage;
            userName = user.username;
            userType = 'AdminUser';
        } else if (activeTab === 'employees' || user.employeeName) {
            userImage = user.employeeImage;
            userName = user.employeeName;
            userType = 'Employee';
        }

        // Default image if none is provided
        const defaultImage = '/path/to/default/avatar.png'; // Add your default image path

        return (
            <li
                key={user._id}
                className={`list-group-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                style={{ backgroundColor: selectedUser?._id === user._id ? '#80808069' : '' }}
                onClick={() => onUserSelect(user, userType)}
            >
                <div className="d-flex align-items-center">
                    <img
                        src={userImage ? `${import.meta.env.VITE_BASE_URL}${userImage.replace('uploads/', '')}` : defaultImage}
                        className="avatar rounded-circle"
                        alt={userName}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                        }}
                    />
                    <div className="flex-fill ms-3">
                        <h6 className="mb-0">{userName || 'Unknown User'}</h6>
                        <small className="text-muted">{userType}</small>
                    </div>
                </div>
            </li>
        );
    };

    const allUsers = [...admins, ...employees].filter(Boolean);

    return (
        <div id="mytask-layout">
            <Sidebar />
            <div className="main px-lg-4 px-md-4">
                <div className="body d-flex py-lg-3 py-md-2">
                    <ChatLayout
                        users={activeTab === 'admins' ? admins :
                            activeTab === 'employees' ? employees :
                                activeTab === 'groups' ? allUsers :
                                    groups}
                        groups={groups}
                        socket={socket}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        messages={messages.map(msg => ({
                            ...msg,
                            isCurrentUser: msg.senderId === currentStudent._id
                        }))}
                        newMessage={newMessage}
                        activeTab={activeTab}
                        tabs={[
                            { id: 'admins', label: 'Admins' },
                            { id: 'employees', label: 'Agents' },
                            { id: 'groups', label: 'Groups' }
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
                        onClearChat={handleClearChat}
                        fetchChatSettings={fetchChatSettings}
                    />
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
    );
};

export default StudentChat; 