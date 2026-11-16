import { baseurl } from "../Component/BaseURL/BaseURL";

function headers() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || "ERP AI Chat request failed");
  return body;
}

export async function fetchAiChatCapabilities() {
  return readResponse(await fetch(`${baseurl}/api/ai-chat/capabilities`, { headers: headers() }));
}

export async function sendAiChatMessage({ message, audio, attachments }) {
  const form = new FormData();
  if (message) form.append("message", message);
  if (audio) form.append("audio", audio, "voice-message.webm");
  attachments.forEach((file) => form.append("attachments", file, file.name));
  return readResponse(await fetch(`${baseurl}/api/ai-chat/messages`, {
    method: "POST",
    headers: headers(),
    body: form,
  }));
}
