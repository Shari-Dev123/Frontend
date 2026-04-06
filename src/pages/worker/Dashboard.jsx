import { useEffect } from 'react'
import { Briefcase, MapPin, CheckCircle, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useJobStore } from '../../store/jobStore'

const WorkerDashboard = () => {
  const { user } = useAuthStore()
  const { jobs, fetchJobs } = useJobStore()

  useEffect(() => { fetchJobs() }, [])

  const myJobs = jobs.filter(j =>
    j.assignedTo?._id === user?._id || j.assignedTo === user?._id
  )

  const stats = [
    { label: 'Total Jobs',  value: myJobs.length,                                          icon: Briefcase,   color: 'blue'   },
    { label: 'Active',      value: myJobs.filter(j => j.status === 'active').length,       icon: MapPin,      color: 'green'  },
    { label: 'Pending',     value: myJobs.filter(j => j.status === 'pending').length,      icon: Clock,       color: 'yellow' },
    { label: 'Completed',   value: myJobs.filter(j => j.status === 'completed').length,    icon: CheckCircle, color: 'red'    },
  ]

  const activeCount = myJobs.filter(j => j.status === 'active').length

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          Welcome back, {user?.name}
        </h2>
        <p style={{ color: 'var(--gray-400)', margin: '0.25rem 0 0' }}>
          Here is an overview of your assigned jobs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My Jobs Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-title">
          <span>My Jobs</span>
          <span className="badge badge-active">{activeCount} Active</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="job-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    No jobs have been assigned to you yet.
                  </td>
                </tr>
              ) : (
                myJobs.slice(0, 5).map(job => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                        {job.description?.substring(0, 40)}
                      </div>
                    </td>
                    <td>{job.location?.address || '—'}</td>
                    <td>
                      <span className={`badge ${job.status === 'active' ? 'badge-active' : 'badge-inactive'}`}
                        style={{ textTransform: 'capitalize' }}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      {job.scheduledDate
                        ? new Date(job.scheduledDate).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard