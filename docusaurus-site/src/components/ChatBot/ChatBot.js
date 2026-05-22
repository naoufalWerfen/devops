import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';

const API_BASE = 'http://localhost:3001/api';

function MarkdownLite({ text }) {
  const blocks = text.split(/```(\w*)\n([\s\S]*?)```/g);
  const elements = [];

  for (let i = 0; i < blocks.length; i++) {
    if (i % 3 === 0) {
      // Texto normal — parse tables as proper HTML tables
      const lines = blocks[i].split('\n');
      let tableBuffer = [];

      const flushTable = () => {
        if (tableBuffer.length < 2) {
          // Not a real table, render as regular lines
          tableBuffer.forEach((line, li) => renderLine(line, `fallback-${i}-${li}`));
          tableBuffer = [];
          return;
        }
        // Find header and body rows (skip separator row)
        const headerRow = tableBuffer[0];
        const bodyRows = tableBuffer.slice(1).filter(r => !(/^\|[\s\-:|]+\|?$/.test(r)));
        const hCells = headerRow.split('|').filter(c => c.trim());
        elements.push(
          <div key={`tw-${i}-${tableBuffer[0]}`} className="chat-table-wrap">
            <table className="chat-table">
              <thead>
                <tr>{hCells.map((c, ci) => <th key={ci}>{c.trim()}</th>)}</tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim());
                  return (
                    <tr key={ri}>
                      {cells.map((c, ci) => {
                        let content = c.trim()
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`([^`]+)`/g, '<code>$1</code>');
                        return <td key={ci} dangerouslySetInnerHTML={{ __html: content }} />;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableBuffer = [];
      };

      const renderLine = (line, key) => {
        if (/^#{1,3}\s/.test(line)) {
          const level = line.match(/^(#{1,3})/)[1].length;
          const content = line.replace(/^#{1,3}\s*/, '');
          elements.push(
            React.createElement(`h${level + 2}`, { key, className: 'chat-heading' }, content)
          );
          return;
        }
        let processed = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/^[-•]\s/, '• ');
        if (processed.trim()) {
          elements.push(
            <p key={key} className="chat-p" dangerouslySetInnerHTML={{ __html: processed }} />
          );
        }
      };

      lines.forEach((line, li) => {
        if (line.startsWith('|')) {
          tableBuffer.push(line);
        } else {
          if (tableBuffer.length > 0) flushTable();
          renderLine(line, `p-${i}-${li}`);
        }
      });
      if (tableBuffer.length > 0) flushTable();

    } else if (i % 3 === 1) {
      // Language identifier — skip
    } else {
      // Code block content
      elements.push(
        <pre key={`code-${i}`} className="chat-code-block"><code>{blocks[i]}</code></pre>
      );
    }
  }

  return <>{elements}</>;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente DevOps de Werfen. Puedo ayudarte con información sobre servidores, stack tecnológico, versiones EOL y vulnerabilidades. ¿En qué puedo ayudarte?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: '¡Chat reiniciado! ¿En qué puedo ayudarte?' },
    ]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente DevOps'}
        title="Asistente DevOps"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <span className="chatbot-header__icon">🤖</span>
              <div>
                <div className="chatbot-header__title">Asistente DevOps</div>
                <div className="chatbot-header__subtitle">Servidores · Stack · EOL · Vulnerabilidades</div>
              </div>
            </div>
            <button className="chatbot-header__clear" onClick={clearChat} title="Limpiar chat">
              🗑️
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role} ${msg.isError ? 'chatbot-msg--error' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="chatbot-msg__avatar">🤖</div>
                ) : null}
                <div className="chatbot-msg__bubble">
                  {msg.role === 'assistant' ? (
                    <MarkdownLite text={msg.content} />
                  ) : (
                    <p className="chat-p">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__avatar">🤖</div>
                <div className="chatbot-msg__bubble chatbot-msg__bubble--loading">
                  <span className="chatbot-typing">
                    <span></span><span></span><span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre servidores, stack, EOL..."
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
