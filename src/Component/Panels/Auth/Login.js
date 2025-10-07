// Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Static admin credentials
  const ADMIN_CREDENTIALS = {
    email: "admin@gmail.com",
    password: "1234"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check for static admin credentials first
      if (username.trim() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Admin login successful
        const adminUser = {
          id: 1,
          username: "admin",
          email: ADMIN_CREDENTIALS.email,
          role: "admin",
          name: "Administrator"
        };
        
        // Store admin data in localStorage
        localStorage.setItem("user", JSON.stringify(adminUser));
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());
        
        // Navigate to admin dashboard or appropriate route
        navigate("/admindashboard");
        return;
      }

      // If not admin, proceed with regular login API call
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());
        
        // Store role-specific flags
        if (data.user.role.toLowerCase() === 'admin') {
          localStorage.setItem("isAdmin", "true");
        } else if (data.user.role.toLowerCase() === 'staff') {
          localStorage.setItem("isStaff", "true");
        } else if (data.user.role.toLowerCase() === 'retailer') {
          localStorage.setItem("isRetailer", "true");
        }
        
        navigate(data.route);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome Back 👋</h2>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Username Field (Email or Mobile) */}
        <div className="form-group">
          <label htmlFor="username">Email or Mobile Number</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your email or mobile number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;