import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { Camera, MapPin, RefreshCw, Check, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CheckIn = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [facingMode, setFacingMode] = useState('user')

  // Get location on mount
useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          toast.error('Location access required for check-in')
        },
        { enableHighAccuracy: true }
      )
    }
  }, [])

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImage(imageSrc)
  }, [webcamRef])

  const retake = () => {
    setCapturedImage(null)
  }

  const handleCheckIn = async () => {
    if (!capturedImage || !location) {
      toast.error('Photo and location required')
      return
    }

    setLoading(true)
    try {
      // Convert base64 to file
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const file = new File([blob], 'checkin.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('photo', file)
      formData.append('jobId', jobId)
      formData.append('coordinates', JSON.stringify([location.lng, location.lat]))
      formData.append('timestamp', new Date().toISOString())
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
      formData.append('deviceInfo', JSON.stringify({
        deviceId: navigator.userAgent,
        model: navigator.platform,
        os: navigator.userAgent,
        isEmulator: false
      }))

      await axios.post('/api/attendance/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Check-in successful!')
      navigate('/worker/jobs')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: facingMode
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Check In</h2>
      
      {!capturedImage ? (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="camera-view"
          />
          
          <div className="camera-overlay">
            <div className="face-frame"></div>
          </div>

          <div className="camera-info">
            <div className="location-badge">
              <MapPin size={14} />
              {location ? 'Location captured' : 'Getting location...'}
            </div>
            <div className="location-badge">
              <Camera size={14} />
              {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
            </div>
          </div>

          <div className="camera-controls">
            <button 
              className="camera-btn"
              onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
            >
              <RefreshCw size={24} />
            </button>
            
            <button className="capture-btn" onClick={capture} />
            
            <button className="camera-btn" onClick={() => navigate(-1)}>
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <img src={capturedImage} alt="Captured" className="preview-image" />
          
          <div className="preview-actions">
            <button 
              className="btn btn-secondary"
              onClick={retake}
              disabled={loading}
            >
              <RefreshCw size={18} />
              Retake
            </button>
            <button 
              className="btn btn-success"
              onClick={handleCheckIn}
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  <Check size={18} />
                  Confirm Check In
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f8fafc', 
        borderRadius: '12px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        <p style={{ marginBottom: '8px', fontWeight: 600, color: '#1e293b' }}>
          Instructions:
        </p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Make sure your face is clearly visible</li>
          <li>Ensure good lighting conditions</li>
          <li>Remove sunglasses or masks</li>
          <li>Stay within the frame</li>
        </ul>
      </div>
    </div>
  )
}

export default CheckIn