import React, { useState, useEffect } from 'react';
// import './GSPTokenManager.css';
import { baseurl } from './BaseURL/BaseURL';

const GSPTokenManager = () => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [stats, setStats] = useState({
    lastGenerated: null,
    expiresIn: null
  });

  const API_BASE = `${baseurl}/api/gsp`;

  // Show status message
  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
    setTimeout(() => {
      setStatus({ message: '', type: '' });
    }, 5000);
  };

  // Update token display
  const updateTokenDisplay = (data) => {
    if (data && data.access_token) {
      setTokenData(data);
      
      // Calculate expires in
      if (data.expires_at) {
        const expiresDate = new Date(data.expires_at);
        const now = new Date();
        const diffHours = (expiresDate - now) / (1000 * 60 * 60);
        setStats(prev => ({
          ...prev,
          expiresIn: diffHours > 0 ? `${diffHours.toFixed(2)} hours` : 'Expired'
        }));
      }
      
      setStats(prev => ({
        ...prev,
        lastGenerated: new Date().toLocaleString()
      }));
    } else {
      setTokenData(null);
      setStats({
        lastGenerated: null,
        expiresIn: null
      });
    }
  };

  // Generate new token
  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        showStatus('✅ Token generated successfully!', 'success');
        await getValidToken();
      } else {
        showStatus(`❌ Failed: ${data.message || data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get valid token (auto-managed)
  const getValidToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/valid-token`);
      const data = await response.json();

      if (data.success) {
        updateTokenDisplay(data.data);
        showStatus('✅ Valid token retrieved', 'success');
      } else {
        showStatus(`⚠️ ${data.message}`, 'warning');
        updateTokenDisplay(null);
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check token status
  const checkToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/get-token`);
      const data = await response.json();

      if (data.success && data.data) {
        updateTokenDisplay(data.data);
        showStatus('✅ Token is active', 'success');
      } else {
        showStatus('⚠️ No active token found', 'warning');
        updateTokenDisplay(null);
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        showStatus('✅ Token refreshed successfully!', 'success');
        await getValidToken();
      } else {
        showStatus(`❌ Failed to refresh: ${data.message || data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check token on component mount
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <div className="gsp-container">
      <div className="gsp-header">
        <h1>🔐 GSP Token Manager</h1>
        <p>Generate and manage your GSP authentication tokens</p>
      </div>

      <div className="gsp-content">
        <div className="button-group">
          <button 
            className="btn-primary" 
            onClick={generateToken}
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : '✨ Generate New Token'}
          </button>
          <button 
            className="btn-success" 
            onClick={getValidToken}
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : '🔄 Get Valid Token'}
          </button>
          <button 
            className="btn-info" 
            onClick={checkToken}
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : '🔍 Check Token Status'}
          </button>
          <button 
            className="btn-warning" 
            onClick={refreshToken}
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : '🔁 Refresh Token'}
          </button>
        </div>

        {status.message && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="token-section">
          <h3>📋 Current Token Information</h3>
          
          {!tokenData ? (
            <div className="token-info warning">
              <p>⚠️ No active token found. Click "Generate New Token" to create one.</p>
            </div>
          ) : (
            <>
              <div className="token-info success">
                <p><strong>Token Type:</strong> {tokenData.token_type || 'Bearer'}</p>
                <p><strong>Expires At:</strong> {tokenData.expires_at || 'N/A'}</p>
                <p><strong>Status:</strong> <span className="status-badge active">✅ Active</span></p>
              </div>
              <div className="token-display">
                <strong>Access Token:</strong><br />
                <span className="token-value">{tokenData.access_token}</span>
              </div>
            </>
          )}
        </div>

        <div className="token-section">
          <h3>📊 Usage Statistics</h3>
          <div className="stats">
            <p><strong>Last generated:</strong> {stats.lastGenerated || 'Never'}</p>
            <p><strong>Token expires in:</strong> {stats.expiresIn || '-'}</p>
          </div>
        </div>
      </div>

      <div className="gsp-footer">
        <p>API Base URL: {API_BASE}</p>
      </div>
    </div>
  );
};

export default GSPTokenManager;