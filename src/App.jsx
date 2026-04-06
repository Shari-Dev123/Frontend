import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import Workers from './pages/admin/Workers'
import Jobs from './pages/admin/Jobs'
import LiveTracking from './pages/admin/LiveTracking'
import Attendance from './pages/admin/Attendance'
import Chat from './pages/admin/Chat'

// Worker Pages
import WorkerLayout from './layouts/WorkerLayout'
import WorkerDashboard from './pages/worker/Dashboard'
import MyJobs from './pages/worker/MyJobs'
import CheckIn from './pages/worker/CheckIn'
import WorkerChat from './pages/worker/Chat'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/login" />
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" />
    }
    return children
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="workers" element={<Workers />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        {/* Worker Routes */}
        <Route path="/worker" element={
          <ProtectedRoute allowedRoles={['field_worker']}>
            <WorkerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<WorkerDashboard />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="checkin/:jobId" element={<CheckIn />} />
          <Route path="chat" element={<WorkerChat />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={
          isAuthenticated ? (
            user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/worker" />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </>
  )
}

export default App