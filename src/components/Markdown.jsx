import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { saveAs } from "file-saver";
import { debounce } from "lodash";
import "highlight.js/styles/github-dark.css";
import "./MarkdownEditor.css";

export default function MarkdownEditor() {
  const exampleMarkdown = `# 📘 Advanced Markdown Editor

Welcome to the **ultimate Markdown compiler**! 

## 🚀 Features
- Live Markdown editing with real-time preview
- GitHub-flavored markdown support
- Syntax highlighting for 180+ languages
- 🧠 Secure JS code execution
- Multiple export formats
- Dark/light theme support
- Customizable editor experience

## 🧪 Try Some Code
\`\`\`js
// Simple JavaScript execution
const name = "Developer";
const greeting = "Hello, " + name + "! 👋";
greeting;
\`\`\`

\`\`\`js
// Mathematical operations
const calculate = () => {
  return (15 * 3 + 7) / 4;
};
calculate();
\`\`\`

\`\`\`python
# Python example (display only)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(10)
\`\`\`

## 📊 Table Support
| Feature | Status | Version |
|---------|--------|---------|
| Live Preview | ✅ | 2.0 |
| Code Execution | ✅ | 2.0 |
| Export Options | ✅ | 2.0 |
| Mobile Friendly | ✅ | 2.0 |

## 🎨 Formatting Examples
**Bold text** and *italic text* and ~~strikethrough~~

> This is a blockquote - great for highlighting important information.

---

### 🎯 Lists
- [x] Task list item 1
- [ ] Task list item 2
- [ ] Task list item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

## 🔗 Links & Images
[Visit GitHub](https://github.com) • [Markdown Guide](https://www.markdownguide.org)

![Markdown Logo](https://markdown-here.com/img/icon256.png)

---

*Built with React and ❤️*`;

  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const [compiledMarkdown, setCompiledMarkdown] = useState(exampleMarkdown);
  const [darkMode, setDarkMode] = useState(true);
  const [autoCompile, setAutoCompile] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [copied, setCopied] = useState(false);
  const [outputs, setOutputs] = useState({});
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const editorRef = useRef(null);

  // Debounced compilation
  const debouncedCompile = useRef(
    debounce((value) => {
      setCompiledMarkdown(value);
    }, 300)
  ).current;

  useEffect(() => {
    if (autoCompile) {
      debouncedCompile(markdown);
    }
  }, [markdown, autoCompile, debouncedCompile]);

  useEffect(() => {
    const words = markdown.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(markdown.length);
    
    // Save to localStorage
    localStorage.setItem('markdown-content', markdown);
  }, [markdown]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMarkdown = localStorage.getItem('markdown-content');
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
      setCompiledMarkdown(savedMarkdown);
    }
  }, []);

  const handleCompile = () => {
    setCompiledMarkdown(markdown);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadWord = () => {
    const element = document.querySelector(".preview-content");
    if (!element) return;

    const htmlContent = element.innerHTML;
    
    // Fix for dark mode text colors in Word export
    const processedHtml = htmlContent
      .replace(/color:\s*#ffffffff;/g, 'color: #333333;')
      .replace(/color:\s*#ffffff;/g, 'color: #333333;')
      .replace(/background:\s*#1a1a1a;/g, 'background: #f8f9fa;')
      .replace(/background:\s*#2d2d2d;/g, 'background: #ffffff;');

    const html = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Exported Markdown Document</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 2cm; 
            color: #333333;
            background: white;
          }
          pre { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 5px; 
            overflow-x: auto;
            color: #333333;
          }
          code { 
            background: #f5f5f5; 
            padding: 2px 4px; 
            border-radius: 3px;
            color: #333333;
          }
          blockquote { 
            border-left: 4px solid #4CAF50; 
            margin: 1rem 0; 
            padding-left: 20px; 
            color: #666666;
            background: #f9f9f9;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #4CAF50; 
            color: white; 
          }
          h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
          }
          a {
            color: #2196F3;
          }
        </style>
      </head>
      <body>${processedHtml}</body>
      </html>`;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    saveAs(blob, "markdown-export.doc");
  };

  const downloadHTML = () => {
    const element = document.querySelector(".preview-content");
    if (!element) return;

    // Clone and process the content for light mode export
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = element.innerHTML;
    
    // Remove dark mode specific styles
    const darkElements = tempDiv.querySelectorAll('[style*="background: #1a1a1a"], [style*="background: #2d2d2d"]');
    darkElements.forEach(el => {
      el.style.background = '#f8f9fa';
    });
    
    const whiteTextElements = tempDiv.querySelectorAll('[style*="color: #ffffff"], [style*="color: #ffffffff"]');
    whiteTextElements.forEach(el => {
      el.style.color = '#333333';
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Export</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            background: white; 
            color: #333333; 
          }
          pre { 
            background: #f6f8fa; 
            color: #24292e; 
            padding: 20px; 
            border-radius: 8px; 
            overflow-x: auto; 
            border: 1px solid #e1e4e8; 
          }
          code { 
            background: rgba(175, 184, 193, 0.2); 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
            color: #24292e;
          }
          pre code { 
            background: none; 
            padding: 0; 
          }
          blockquote { 
            border-left: 4px solid #4CAF50; 
            margin: 20px 0; 
            padding: 10px 20px; 
            background: #f9f9f9; 
            color: #555; 
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #4CAF50; 
            color: white; 
            font-weight: 600; 
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          img { 
            max-width: 100%; 
            height: auto; 
            border-radius: 8px; 
          }
          h1, h2, h3, h4, h5, h6 { 
            color: #2c3e50; 
            margin-top: 24px; 
          }
          h1 { 
            border-bottom: 2px solid #4CAF50; 
            padding-bottom: 10px; 
          }
          a {
            color: #2196F3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .code-block {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            margin: 1.5rem 0;
            overflow: hidden;
          }
          .code-header {
            background: #ffffff;
            padding: 12px 16px;
            border-bottom: 1px solid #e1e4e8;
          }
          .output {
            background: #ffffff;
            border-top: 1px solid #e1e4e8;
            padding: 12px 16px;
          }
        </style>
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    saveAs(blob, "markdown-export.html");
  };

  const downloadText = () => {
    const blob = new Blob([markdown], { type: "text/plain" });
    saveAs(blob, "markdown-content.txt");
  };

  const clearEditor = () => {
    if (window.confirm("Are you sure you want to clear the editor? This cannot be undone.")) {
      setMarkdown("");
      setCompiledMarkdown("");
      setOutputs({});
    }
  };

  // Secure code execution
  const runCode = (code, index) => {
    try {
      // Use Function constructor as safer alternative to eval
      const fn = new Function(code);
      const result = fn();
      setOutputs((prev) => ({ ...prev, [index]: String(result) }));
    } catch (error) {
      setOutputs((prev) => ({
        ...prev,
        [index]: `❌ Error: ${error.message}`,
      }));
    }
  };

  // Custom renderer for code blocks
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");
      const language = match ? match[1] : "";

      if (!inline && language === "js") {
        const blockIndex = node?.position?.start?.line || Math.random();

        return (
          <div className="code-block">
            <div className="code-header">
              <span className="language-tag">JavaScript</span>
              <button 
                className="run-btn" 
                onClick={() => runCode(code, blockIndex)}
                title="Run this code"
              >
                ▶ Run Code
              </button>
            </div>
            <pre className="code-content">
              <code className={className}>{code}</code>
            </pre>
            {outputs[blockIndex] && (
              <div className="output">
                <div className="output-header">
                  <strong>Output:</strong>
                </div>
                <div className="output-content">{outputs[blockIndex]}</div>
              </div>
            )}
          </div>
        );
      }

      return !inline ? (
        <div className="code-block">
          <div className="code-header">
            <span className="language-tag">{language || "code"}</span>
          </div>
          <pre className="code-content">
            <code className={className}>{code}</code>
          </pre>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  const insertText = (before, after = "") => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📝</span>
            <h1>Markdown Pro Editor</h1>
          </div>
          <div className="header-actions">
            <button 
              className={`help-btn ${showHelp ? 'active' : ''}`}
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? '✕ Close Help' : '? Help'}
            </button>
          </div>
        </div>
      </header>

      {/* Help Panel */}
      {showHelp && (
        <div className="help-panel">
          <div className="help-content">
            <h3>🎯 Markdown Quick Reference</h3>
            <div className="help-grid">
              <div className="help-section">
                <h4>Text Formatting</h4>
                <p>**<strong>Bold</strong>**</p>
                <p>*<em>Italic</em>*</p>
                <p>~~<del>Strikethrough</del>~~</p>
              </div>
              <div className="help-section">
                <h4>Headers</h4>
                <p># H1</p>
                <p>## H2</p>
                <p>### H3</p>
              </div>
              <div className="help-section">
                <h4>Lists</h4>
                <p>- Item 1</p>
                <p>- Item 2</p>
                <p>1. First</p>
                <p>2. Second</p>
              </div>
              <div className="help-section">
                <h4>Code</h4>
                <p>`inline code`</p>
                <p>```js code block ```</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy success popup */}
      {copied && <div className="copy-popup">✅ Copied to clipboard!</div>}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-section">
          <div className="toolbar-group">
            <button onClick={handleCompile} className="btn btn-primary">
              <span className="btn-icon">⚡</span>
              Compile
            </button>
            <button onClick={handleCopy} className="btn btn-secondary">
              <span className="btn-icon">📋</span>
              Copy MD
            </button>
            <div className="dropdown">
              <button className="btn btn-success">
                <span className="btn-icon">⤓</span>
                Export
              </button>
              <div className="dropdown-content">
                <button onClick={downloadWord}>📝 Word Document</button>
                <button onClick={downloadHTML}>🌐 HTML File</button>
                <button onClick={downloadText}>📄 Text File</button>
              </div>
            </div>
            <button onClick={clearEditor} className="btn btn-danger">
              <span className="btn-icon">🗑️</span>
              Clear
            </button>
          </div>

          <div className="toolbar-group">
            <button onClick={() => insertText("**", "**")} className="toolbar-btn" title="Bold">
              <strong>B</strong>
            </button>
            <button onClick={() => insertText("*", "*")} className="toolbar-btn" title="Italic">
              <em>I</em>
            </button>
            <button onClick={() => insertText("`", "`")} className="toolbar-btn" title="Inline Code">
              `</button>
            <button onClick={() => insertText("\n```js\n", "\n```\n")} className="toolbar-btn" title="Code Block">
              {"</>"}
            </button>
            <button onClick={() => insertText("- ")} className="toolbar-btn" title="List">
              •</button>
            <button onClick={() => insertText("\n> ")} className="toolbar-btn" title="Blockquote">
              ❝</button>
          </div>
        </div>

        <div className="toolbar-section">
          <div className="toolbar-group">
            <label className="switch">
              <input
                type="checkbox"
                checked={autoCompile}
                onChange={(e) => setAutoCompile(e.target.checked)}
              />
              <span className="slider"></span>
              <span className="switch-label">🔄 Auto-Compile</span>
            </label>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="slider"></span>
              <span className="switch-label">🌙 Dark Mode</span>
            </label>
          </div>

          <div className="toolbar-group">
            <label className="input-group">
              <span className="input-label">🔠</span>
              <input
                type="number"
                min={12}
                max={30}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="input-small"
              />
            </label>

            <label className="input-group">
              <span className="input-label">📏</span>
              <input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="input-small"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Words:</span>
          <span className="stat-value">{wordCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Characters:</span>
          <span className="stat-value">{charCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lines:</span>
          <span className="stat-value">{markdown.split('\n').length}</span>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="main-content">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>📝 Editor</h3>
            <div className="panel-actions">
              <button 
                className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                Edit
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>
          </div>
          
          <div className={`editor-container ${activeTab === 'preview' ? 'hidden' : ''}`}>
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              placeholder="Start writing your markdown here... (Pro tip: Use the toolbar above for quick formatting!)"
              style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: lineHeight,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
              }}
              className="editor"
            />
          </div>
        </div>

        <div className="preview-panel">
          <div className="panel-header">
            <h3>👁️ Preview</h3>
            <div className="preview-actions">
              <span className="auto-compile-status">
                {autoCompile ? '🔄 Live' : '⏸️ Paused'}
              </span>
            </div>
          </div>
          <div className="preview-container">
            <div className="preview-content">
              <div 
  className="preview-content"
  style={{ color: darkMode ? "#fff" : "#000" }}
></div>
              <ReactMarkdown
                children={compiledMarkdown}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={renderers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Built with React • Markdown Pro Editor v2.0 • 
            <span className="highlight"> Your changes are automatically saved</span>
          </p>
        </div>
      </footer>
    </div>
  );
}