import { io } from 'socket.io-client'

let socket = null
let watchId = null

export const initializeTracking = () => {
  // Connect socket
  socket = io('http://localhost:5000')
  
  // Start location tracking
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date().toISOString()
        }
        
        // Send to server
        socket.emit('location-update', locationData)
        
        // Also send via API for persistence
        sendLocationToAPI(locationData)
      },
      (error) => {
        console.error('Location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Cleanup function
  return () => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
    if (socket) socket.disconnect()
  }
}

const sendLocationToAPI = async (locationData) => {
  try {
    await fetch('/api/locations/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(locationData)
    })
  } catch (error) {
    // Store locally for sync when online
    storeOffline(locationData)
  }
}

const storeOffline = (data) => {
  const offlineData = JSON.parse(localStorage.getItem('offlineLocations') || '[]')
  offlineData.push(data)
  localStorage.setItem('offlineLocations', JSON.stringify(offlineData))
}

// Sync offline data when back online
export const syncOfflineData = async () => {
  const offlineData = JSON.parse(localStorage.getItem('offlineLocations') || '[]')
  if (offlineData.length === 0) return
  
  try {
    for (const data of offlineData) {
      await fetch('/api/locations/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, isOffline: true })
      })
    }
    localStorage.removeItem('offlineLocations')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}