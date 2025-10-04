import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';
import axios from 'axios';
import './CodeEditor.css';
import UsersList from './UsersList';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'c', name: 'C', extension: 'c' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' }
];

const DEFAULT_CODE = {
  javascript: 'console.log("Hello, World!");',
  python: 'print("Hello, World!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  rust: 'fn main() {\n    println!("Hello, World!");\n}'
};

const CodeEditor = ({ roomId: propRoomId, userName }) => {
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [roomId, setRoomId] = useState(propRoomId || 'default-room');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [users, setUsers] = useState([]);
  
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      
      // Join the room
      socketRef.current.emit('join-room', {
        roomId,
        userName: userName || 'Anonymous'
      });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle room not found
    socketRef.current.on('room-not-found', ({ roomId }) => {
      alert(`Room ${roomId} does not exist!`);
      setIsConnected(false);
    });

    // Handle code updates from other users
    socketRef.current.on('code-update', (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    // Handle remote edits
    socketRef.current.on('remote-edit', (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    socketRef.current.on('request-code', (targetSocketId) => {
      socketRef.current.emit('send-current-code', {
        targetSocketId,
        code: code
      });
    });

    // Handle user joined
    socketRef.current.on('user-joined', ({ name }) => {
      console.log(`${name} joined the room`);
    });

    // Handle user left
    socketRef.current.on('user-left', ({ name }) => {
      console.log(`${name} left the room`);
    });

    // Handle users update
    socketRef.current.on('users-update', (roomUsers) => {
      const updatedUsers = roomUsers.map(user => ({
        ...user,
        isYou: user.id === socketRef.current.id
      }));
      setUsers(updatedUsers);
      setConnectedUsers(roomUsers.length);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room');
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    setCode(value || '');
    
    // Emit code changes using local-edit
    if (socketRef.current && isConnected) {
      socketRef.current.emit('local-edit', {
        roomId,
        code: value || ''
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage] || '');
    setOutput('');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Error: No code to execute');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');

    try {
      const response = await axios.post('http://localhost:8000/api/code/run', {
        language,
        code,
        version: '*'
      });

      const result = response.data;
      let outputText = '';

      if (result.stdout) {
        outputText += `Output:\n${result.stdout}`;
      }

      if (result.stderr) {
        outputText += `${outputText ? '\n\n' : ''}Errors:\n${result.stderr}`;
      }

      if (!result.stdout && !result.stderr) {
        outputText = 'Code executed successfully (no output)';
      }

      setOutput(outputText);
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRoomChange = (newRoomId) => {
    if (newRoomId && newRoomId !== roomId) {
      setRoomId(newRoomId);
      if (socketRef.current) {
        socketRef.current.emit('join-room', newRoomId);
      }
    }
  };

  return (
    <div className="code-editor">
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
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div className="user-count">
            👥 {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>📝 Code Editor</h3>
          </div>
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on'
            }}
          />
        </div>

        <div className="output-pane">
          <div className="pane-header">
            <h3>📤 Output</h3>
          </div>
          <pre className="output-content">{output || 'Click "Run Code" to see output here...'}</pre>
        </div>

        <UsersList users={users} />
      </div>
    </div>
  );
};

export default CodeEditor;
