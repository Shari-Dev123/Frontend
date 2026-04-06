import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Shield, User, Mail, Phone, Lock, MapPin, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: { street: '', city: '', state: '', zipCode: '' }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const result = await register(formData)
    
    if (result.success) {
      toast.success('Registration successful! Please wait for admin approval.')
      navigate('/login')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo">
              <Shield size={32} />
            </div>
            <h1>Join SecureGuard</h1>
            <p>Register as a security professional and start your journey with us</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div className="auth-input-group">
                  <User className="auth-input-icon" size={20} />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <Mail className="auth-input-icon" size={20} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <Phone className="auth-input-icon" size={20} />
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="button" 
                  className="auth-btn"
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="auth-input-group">
                  <Lock className="auth-input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <Lock className="auth-input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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

                <div className="auth-input-group">
                  <MapPin className="auth-input-icon" size={20} />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, street: e.target.value}
                    })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, city: e.target.value}
                    })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...formData.address, zipCode: e.target.value}
                    })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="auth-btn btn-secondary"
                    onClick={() => setStep(1)}
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="auth-btn"
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}

            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register