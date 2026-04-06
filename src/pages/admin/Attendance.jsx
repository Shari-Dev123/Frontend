import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Search,
  Calendar,
  UserCheck,
  UserX,
  LogOut,
  Clock
} from 'lucide-react'
import API from '../../api'
import toast from 'react-hot-toast'

const Attendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))

  useEffect(() => {
    fetchAttendance()
  }, [date])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/attendance?date=${date}`)
      setAttendance(res.data.data || res.data)
    } catch {
      toast.error('Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = attendance.filter(a =>
    a.worker?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '—'

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const stats = [
    {
      label: 'Total Present',
      value: attendance.filter(a => a.checkIn).length,
      color: 'green',
      icon: <UserCheck size={20} />
    },
    {
      label: 'Checked Out',
      value: attendance.filter(a => a.checkOut).length,
      color: 'blue',
      icon: <LogOut size={20} />
    },
    {
      label: 'On Duty',
      value: attendance.filter(a => a.checkIn && !a.checkOut).length,
      color: 'yellow',
      icon: <Clock size={20} />
    },
    {
      label: 'Absent',
      value: attendance.filter(a => !a.checkIn).length,
      color: 'red',
      icon: <UserX size={20} />
    }
  ]

  const getStatusBadge = (record) => {
    if (record.checkOut) {
      return <span className="badge badge-inactive">Completed</span>
    }
    if (record.checkIn) {
      return <span className="badge badge-active">On Duty</span>
    }
    return (
      <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
        Absent
      </span>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Attendance</h2>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <div
          className="card-body"
          style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }}
            />
            <input
              type="text"
              placeholder="Search worker..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} style={{ color: 'var(--gray-400)' }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              Loading attendance records...
            </div>
          ) : (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}
                    >
                      No attendance records found for this date.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record, i) => (
                    <tr key={i}>
                      <td>
                        <div className="worker-cell">
                          <div className="worker-avatar">
                            {record.worker?.name?.charAt(0)}
                          </div>
                          <div className="worker-info">
                            <div className="worker-name">{record.worker?.name}</div>
                            <div className="worker-phone">{record.worker?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatTime(record.checkIn)}</td>
                      <td>{formatTime(record.checkOut)}</td>
                      <td>{getDuration(record.checkIn, record.checkOut)}</td>
                      <td>{record.location?.address || '—'}</td>
                      <td>{getStatusBadge(record)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Attendance