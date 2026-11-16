import React, { useEffect, useRef, useState } from "react";
import { fetchAiChatCapabilities, sendAiChatMessage } from "../../services/aiChatService";
import "./Chatbot.css";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function ActionIcon({ name }) {
  if (name === "attach") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.5 6.5-7.8 7.8a3.1 3.1 0 0 0 4.4 4.4l8-8a4.8 4.8 0 0 0-6.8-6.8l-8.1 8.1a6.5 6.5 0 0 0 9.2 9.2l7.2-7.2" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="13" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>;
}

function userEligible() {
  if (localStorage.getItem("isLoggedIn") !== "true") return false;
  const role = JSON.parse(localStorage.getItem("user") || "{}")?.role?.toLowerCase();
  return role === "admin" || role === "staff";
}

function MessageContent({ message }) {
  return (
    <div className={`erp-chat-message erp-chat-${message.role}`}>
      {message.role === "user" ? <><span className="erp-chat-message-label">You</span><p>{message.text}</p></> : (
        <>
          <span className="erp-chat-message-label">ERP assistant</span>
          <p>{message.answer}</p>
          {message.blocks?.length > 0 && (
            <div className="erp-chat-blocks">
              {message.blocks.map((block, index) => block.type === "metric" ? (
                <div className="erp-chat-metric" key={`${block.label}-${index}`}>
                  <span>{block.label}</span><strong>{block.value}</strong>
                </div>
              ) : (
                <div className="erp-chat-table-wrap" key={index}>
                  <table><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                    <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{block.columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          {message.citations?.length > 0 && <div className="erp-chat-citations"><span>Verified sources</span>{message.citations.map((citation) => <a href={citation.href} key={citation.href}>{citation.label}</a>)}</div>}
          {message.navigation?.length > 0 && <div className="erp-chat-navigation">{message.navigation.map((link) => link.href && <a href={link.href} key={link.href}>{link.label}</a>)}</div>}
        </>
      )}
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(userEligible());
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const mediaRecorder = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userEligible()) return undefined;
    fetchAiChatCapabilities().then((data) => setEnabled(data.enabled === true)).catch(() => setEnabled(userEligible()));
    return undefined;
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const selectFiles = (event) => {
    setError("");
    const files = Array.from(event.target.files || []);
    const invalid = files.find((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES);
    if (invalid) {
      setError("Use JPG, PNG, or PDF files up to 10 MB each.");
      return;
    }
    setAttachments(files);
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorder.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not available in this browser.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      const audio = new File(chunks, "voice-message.webm", { type: recorder.mimeType || "audio/webm" });
      if (audio.size > MAX_FILE_BYTES) setError("Audio is limited to 10 MB.");
      else await submit("", audio);
    };
    mediaRecorder.current = recorder;
    recorder.start();
    setRecording(true);
    setStatus("Recording. Select the microphone again to send.");
  };

  const submit = async (explicitMessage = draft, audio = null) => {
    const message = explicitMessage.trim();
    if (!message && !audio && !attachments.length) return;
    setDraft("");
    setAttachments([]);
    setLoading(true); setError(""); setStatus("Processing ERP request.");
    if (message) setMessages((current) => [...current, { role: "user", text: message }]);
    try {
      const result = await sendAiChatMessage({ message, audio, attachments });
      setMessages((current) => [...current, { role: "assistant", ...result }]);
      setStatus(result.status === "clarification_needed" ? "Clarification required." : "ERP response ready.");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("Request failed.");
    } finally { setLoading(false); }
  };

  if (!enabled) return null;
  return (
    <>
      <button className="erp-chat-fab" onClick={() => setOpen((value) => !value)} aria-label="Open ERP AI Chat" aria-expanded={open}>
        <span aria-hidden="true">AI</span>
      </button>
      {open && <section className="erp-chat-panel" role="dialog" aria-modal="false" aria-labelledby="erp-chat-title">
        <header className="erp-chat-header">
          <div className="erp-chat-title-wrap"><div className="erp-chat-mark" aria-hidden="true">ERP</div><div><h2 id="erp-chat-title">ERP AI Chat</h2><span>Read-only workspace assistant</span></div></div>
          <button onClick={() => setOpen(false)} aria-label="Close ERP AI Chat">Close</button>
        </header>
        <div className="erp-chat-body" aria-live="polite">
          {messages.length === 0 && <div className="erp-chat-empty"><span className="erp-chat-section-label">Workspace intelligence</span><strong>Ask the ledger a question.</strong><p>Answers are read-only and grounded in your ERP records. Include a date, invoice number, or business area for a precise result.</p><div className="erp-chat-suggestions"><button onClick={() => submit("What were today's sales?")}>Today’s sales</button><button onClick={() => submit("Show unpaid invoices")}>Unpaid invoices</button><button onClick={() => submit("Show low stock products")}>Low stock</button></div></div>}
          {messages.map((message, index) => <MessageContent message={message} key={index} />)}
          {loading && <div className="erp-chat-loading">Checking approved ERP sources…</div>}
          {error && <div className="erp-chat-error" role="alert">{error}</div>}
        </div>
        <div className="erp-chat-composer">
          {attachments.length > 0 && <div className="erp-chat-attachments">{attachments.map((file) => <span key={file.name}>{file.name}</span>)}</div>}
          <label className="erp-chat-input-label" htmlFor="erp-chat-input">Question</label>
          <textarea id="erp-chat-input" ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Ask a read-only ERP question" rows="2" maxLength="4000" />
          <div className="erp-chat-toolbar">
            <label className="erp-chat-icon-button" title="Attach JPG, PNG, or PDF" aria-label="Attach JPG, PNG, or PDF"><ActionIcon name="attach" /><input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={selectFiles} /></label>
            <button className={`erp-chat-icon-button ${recording ? "is-recording" : ""}`} onClick={toggleRecording} aria-label={recording ? "Stop and send recording" : "Record voice message"}><ActionIcon name="mic" /></button>
            <span className="erp-chat-status" role="status">{status}</span>
            <button className="erp-chat-send" onClick={() => submit()} disabled={loading || (!draft.trim() && !attachments.length)}>Send</button>
          </div>
        </div>
      </section>}
    </>
  );
}
