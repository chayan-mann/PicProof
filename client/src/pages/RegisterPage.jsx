import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', name: '', moderationPreferences: { ageRating: 'under18', isHarmful: false, isSynthetic: false, syntheticImages: false } });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const isModerationField = ['ageRating', 'isHarmful', 'isSynthetic', 'syntheticImages'].includes(name);

    if (isModerationField) {
      setFormData((prev) => ({
        ...prev,
        moderationPreferences: {
          ...prev.moderationPreferences,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      setAuth(response.data.user, response.data.token);
      navigate('/home');
    } catch (err) {
      // Handle validation errors from express-validator
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors.map(e => e.message));
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join PicProof today</p>

          {error && <div className="error-message">{error}</div>}
          {errors.length > 0 && (
            <div className="error-message">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Your Age</label>
              <select
                name="ageRating"
                value={formData.moderationPreferences.ageRating}
                onChange={handleChange}
                className="input select"
                required
              >
                <option value="under18">Under 18</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
            </div>
            <div className="form-group inline">
              <label>Allow Harmful Content</label>
              <input
                type="checkbox"
                name="isHarmful"
                checked={formData.moderationPreferences.isHarmful}
                onChange={handleChange}
                className="input checkbox"
              />
            </div>
            <div className="form-group inline">
              <label>Allow Synthetic Content</label>
              <input
                type="checkbox"
                name="isSynthetic"
                checked={formData.moderationPreferences.isSynthetic}
                onChange={handleChange}
                className="input checkbox"
              />
            </div>
            <div className="form-group inline">
              <label>Allow Synthetic Images</label>
              <input
                type="checkbox"
                name="syntheticImages"
                checked={formData.moderationPreferences.syntheticImages}
                onChange={handleChange}
                className="input checkbox"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
