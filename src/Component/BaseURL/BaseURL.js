//export const baseurl = "http://localhost:5000";

// 🌐 LIVE SERVER (Production)
// export const baseurl = "http://72.61.237.40:5000";

// 🧪 TEST SERVER (Staging / Development)
const localApi = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const baseurl = process.env.REACT_APP_API_BASE_URL || (localApi ? "http://localhost:5000" : "http://72.61.237.40:3000");

// 🌐 DEMO SERVER (DEMO)
// export const baseurl = "http://187.127.147.245:3000";

