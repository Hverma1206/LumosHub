import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({
  propRoomId,
  roomId,
  handleRoomChange,
  language,
  handleLanguageChange,
  SUPPORTED_LANGUAGES,
  handleRunCode,
  isRunning,
  isConnected,
  connectedUsers,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyRoomId = () => {
    if (propRoomId) {
      navigator.clipboard.writeText(propRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('currentRoom');
    navigate('/room-join');
  };

  return (
    <div className="editor-header">
      <div className="controls">
        {!propRoomId && (
          <div className="control-group">
            <label>Room ID:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              placeholder="Enter room ID"
              className="room-input"
            />
          </div>
        )}
        
        {propRoomId && (
          <div className="room-id-display" onClick={handleCopyRoomId} title="Click to copy">
            <label>Room ID:</label>
            <span className="room-id-value">
              {propRoomId}
              <svg
                className={`copy-icon ${copied ? 'copied' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {copied ? (
                  <>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </>
                ) : (
                  <>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </>
                )}
              </svg>
            </span>
          </div>
        )}
        
        <div className="control-group">
          <label>Language:</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-select"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="run-button"
        >
          {isRunning ? '⏳ Running...' : '▶️ Run Code'}
        </button>
      </div>

      <div className="status">
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? ' Connected' : ' Disconnected'}
        </div>
        <div className="user-count">
          {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
        </div>
        <button onClick={handleLeaveRoom} className="leave-room-button">
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Header;
