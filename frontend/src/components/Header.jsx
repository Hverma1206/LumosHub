import React from 'react';

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
}) => {
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
          👥 {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
        </div>
      </div>
    </div>
  );
};

export default Header;
