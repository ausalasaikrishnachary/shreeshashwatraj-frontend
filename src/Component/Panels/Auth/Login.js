import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ Eye icons
import "./Login.css";
import { baseurl } from "../../BaseURL/BaseURL";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ Password toggle
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
      // ✅ Check for static admin credentials
      if (
        username.trim() === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const adminUser = {
          id: 1,
          username: "admin",
          email: ADMIN_CREDENTIALS.email,
          role: "admin",
          name: "Administrator"
        };

        // Save admin info
        localStorage.setItem("user", JSON.stringify(adminUser));
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());

        navigate("/admindashboard");
        return;
      }

      // ✅ Normal user login via API
      const response = await fetch(`${baseurl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());

        // Role-based flags
        if (data.user.role.toLowerCase() === "admin") {
          localStorage.setItem("isAdmin", "true");
        } else if (data.user.role.toLowerCase() === "staff") {
          localStorage.setItem("isStaff", "true");
        } else if (data.user.role.toLowerCase() === "retailer") {
          localStorage.setItem("isRetailer", "true");
        }

        navigate(data.route);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome Back 👋</h2>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Username */}
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

        {/* Password with Eye Toggle */}
        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="forgot-password-link">
          Forgot Password?{" "}
          <Link
            to="/forgot-password"
            state={{ email: username.includes("@") ? username : "" }}
          >
            Reset Here
          </Link>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
