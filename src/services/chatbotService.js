import { baseurl } from "../Component/BaseURL/BaseURL";

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.id;
  } catch {
    return null;
  }
}

export async function fetchChatbotConfig() {
  const userId = getUserId();
  const res = await fetch(`${baseurl}/api/chatbot/config?userId=${userId}`, {
    headers: { "x-user-id": userId, "Content-Type": "application/json" },
  });
  return res.json();
}

export async function askChatbot(questionId, parameters) {
  const userId = getUserId();
  const res = await fetch(`${baseurl}/api/chatbot/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ questionId, parameters: { ...parameters, userId } }),
  });
  return res.json();
}
