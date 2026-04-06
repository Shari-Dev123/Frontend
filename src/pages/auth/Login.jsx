import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Shield, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const deviceInfo = {
      deviceId: navigator.userAgent,
      model: navigator.platform,
      os: navigator.userAgent
    }

    const result = await login(formData.email, formData.password, deviceInfo)
    
    if (result.success) {
      toast.success('Welcome back!')
      // Navigation handled by App.jsx based on role
      window.location.href = '/'
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={32} />
            </div>
            <h1>SecureGuard Pro</h1>
            <p>Advanced Security Workforce Management System with Real-time Tracking</p>
            
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <CheckCircle size={16} />
                </div>
                <span>GPS Tracking & Geo-fencing</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <CheckCircle size={16} />
                </div>
                <span>Digital Attendance with Photo Verification</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <CheckCircle size={16} />
                </div>
                <span>Real-time Communication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <Mail className="auth-input-icon" size={20} />
              <input
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="auth-input-group">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="auth-input-icon"
                style={{ left: 'auto', right: '16px', cursor: 'pointer' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="auth-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-divider">or</div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login