import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const credentials = {
    "admin@gmail.com": { password: "1234", route: "/admindashboard" },
    "staff@gmail.com": { password: "1234", route: "/staffdashboard" },
    "retailer@gmail.com": { password: "1234", route: "/retailerdashboard" },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = credentials[email];
    if (user && user.password === password) {
      navigate(user.route);
    } else {
      alert("Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome Back 👋</h2>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Button */}
        <button type="submit">Login</button>

        
      </form>
    </div>
  );
}

export default Login;
