import { Link } from "react-router-dom";
import { Shield, Users, Zap, CheckCircle } from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <h1 className="logo">PicProof</h1>
          <div className="header-actions">
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Trust in Every<span className="highlight"> Share</span>
            </h1>
            <p className="hero-subtitle">
              Next-generation social media powered by AI to ensure authenticity
              and trust in every post
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Why PicProof?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>AI-Powered Verification</h3>
              <p>Advanced deepfake detection ensures content authenticity</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Trusted Community</h3>
              <p>Connect with verified users in a safe environment</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Real-Time Updates</h3>
              <p>Stay connected with instant notifications and feeds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Privacy First</h3>
              <p>Your data, your control. Complete privacy protection</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2025 PicProof. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
