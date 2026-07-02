import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { HiOutlinePlay, HiOutlineCode } from 'react-icons/hi';
import './CodeEditor.css';

const CodeEditor = ({ value, onChange, language = 'javascript', disabled = false, placeholder = '' }) => {
  const [activeLanguage, setActiveLanguage] = useState(language);

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'sql', label: 'SQL' },
  ];

  const handleEditorChange = (val) => {
    if (!disabled && onChange) {
      onChange(val || '');
    }
  };

  return (
    <div className="code-editor-container">
      <div className="code-editor-toolbar">
        <div className="toolbar-left">
          <HiOutlineCode className="toolbar-icon" />
          <span className="toolbar-title">Code Editor</span>
        </div>
        <div className="toolbar-right">
          <select
            className="language-select"
            value={activeLanguage}
            onChange={e => setActiveLanguage(e.target.value)}
            disabled={disabled}
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="code-editor-wrapper">
        <Editor
          height="300px"
          language={activeLanguage}
          value={value || placeholder}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
