import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';
import axios from 'axios';
import './CodeEditor.css';
import UsersList from './UsersList';
import Header from './Header';
import OutputConsole from './OutputConsole';

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

const CodeEditor = () => {
  const { roomId: paramRoomId } = useParams()
  const navigate = useNavigate()
  
  const userName = localStorage.getItem('userName') || 'Anonymous'
  
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [roomId, setRoomId] = useState(paramRoomId || 'default-room');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [users, setUsers] = useState([]);
  
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const isRemoteLanguageChange = useRef(false);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      
      socketRef.current.emit('join-room', {
        roomId,
        userName: userName || 'Anonymous'
      });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('room-not-found', ({ roomId }) => {
      alert(`Room ${roomId} does not exist!`);
      setIsConnected(false);
    });

    socketRef.current.on('code-update', (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

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

    socketRef.current.on('user-joined', ({ name }) => {
      console.log(`${name} joined the room`);
    });

    socketRef.current.on('user-left', ({ name }) => {
      console.log(`${name} left the room`);
    });

    socketRef.current.on('users-update', (roomUsers) => {
      const updatedUsers = roomUsers.map(user => ({
        ...user,
        isYou: user.id === socketRef.current.id
      }));
      setUsers(updatedUsers);
      setConnectedUsers(roomUsers.length);
    });

    // Listen for code execution results
    socketRef.current.on('code-executed', ({ executedBy, language: execLanguage, output: execOutput, stderr }) => {
      let outputText = '';
      
      if (execOutput) {
        outputText += `Output:\n${execOutput}`;
      }
      
      if (stderr) {
        outputText += `${outputText ? '\n\n' : ''}Errors:\n${stderr}`;
      }
      
      if (!execOutput && !stderr) {
        outputText = 'Code executed successfully (no output)';
      }
      
      setOutput(outputText);
    });

    // Listen for language changes from other users
    socketRef.current.on('language-updated', ({ language: newLanguage }) => {
      isRemoteLanguageChange.current = true;
      setLanguage(newLanguage);
      setCode(DEFAULT_CODE[newLanguage] || '');
      setOutput('');
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
    
    if (socketRef.current && isConnected) {
      socketRef.current.emit('local-edit', {
        roomId,
        code: value || ''
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (isRemoteLanguageChange.current) {
      isRemoteLanguageChange.current = false;
      return;
    }

    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage] || '');
    setOutput('');

    // Emit language change to all users in the room
    if (socketRef.current && isConnected) {
      socketRef.current.emit('language-change', {
        roomId,
        language: newLanguage
      });
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Error: No code to execute');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/code/run`, {
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

      // Emit execution result to all users in the room
      if (socketRef.current && isConnected) {
        socketRef.current.emit('execute-code', {
          roomId,
          language,
          version: '*',
          code,
          output: result.stdout || '',
          stderr: result.stderr || ''
        });
      }
    } catch (error) {
      console.error('Execution error:', error);
      const errorMsg = error.response?.data?.error || error.message;
      setOutput(`Error: ${errorMsg}`);

      // Emit error to all users in the room
      if (socketRef.current && isConnected) {
        socketRef.current.emit('execute-code', {
          roomId,
          language,
          version: '*',
          code,
          output: '',
          stderr: errorMsg
        });
      }
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

  const handleLogout = () => {
    localStorage.removeItem('currentRoom')
    localStorage.removeItem('userName')
    
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    
    navigate('/login')
  }

  return (
    <div className="code-editor">
      <Header
        propRoomId={paramRoomId}
        roomId={roomId}
        handleRoomChange={handleRoomChange}
        language={language}
        handleLanguageChange={handleLanguageChange}
        SUPPORTED_LANGUAGES={SUPPORTED_LANGUAGES}
        handleRunCode={handleRunCode}
        isRunning={isRunning}
        isConnected={isConnected}
        connectedUsers={connectedUsers}
        onLogout={handleLogout}
      />

      <div className="editor-container">
        <div className="editor-pane">
          <div className="pane-header">
            <h3> Code Editor </h3>
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

        <OutputConsole output={output} />

        <UsersList users={users} />
      </div>
    </div>
  );
};

export default CodeEditor;
