import React from 'react';

const OutputConsole = ({ output }) => {
  return (
    <div className="output-pane">
      <div className="pane-header">
        <h3>Output</h3>
      </div>
      <pre className="output-content">{output || 'Click "Run Code" to see output here...'}</pre>
    </div>
  );
};

export default OutputConsole;
