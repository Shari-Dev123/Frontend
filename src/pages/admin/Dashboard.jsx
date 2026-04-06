import { useEffect } from 'react'
import { useJobStore } from '../../store/jobStore'
import {
  Users,
  Briefcase,
  MapPin,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'

const AdminDashboard = () => {
  const { jobs, stats, recentActivity, fetchJobs, fetchDashboardStats, fetchRecentActivity } = useJobStore()

  useEffect(() => {
    fetchJobs()
    fetchDashboardStats()
    fetchRecentActivity()
  }, [])

  const statCards = [
    {
      label: 'Total Workers',
      value: stats?.totalWorkers ?? '—',
      change: stats?.workerChange ?? null,
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Jobs',
      value: stats?.activeJobs ?? '—',
      change: stats?.activeJobsChange ?? null,
      trend: 'up',
      icon: Briefcase,
      color: 'green'
    },
    {
      label: 'On Duty',
      value: stats?.onDuty ?? '—',
      change: stats?.onDutyChange ?? null,
      trend: 'up',
      icon: MapPin,
      color: 'yellow'
    },
    {
      label: 'Completed Today',
      value: stats?.completedToday ?? '—',
      change: stats?.completedChange ?? null,
      trend: 'up',
      icon: CheckCircle,
      color: 'red'
    }
  ]

  const activeJobs = jobs.filter(j => j.status === 'active')

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.change && (
                <div className={`stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.change} from last week
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Live Map Preview */}
        <div className="dashboard-card">
          <div className="card-title">
            <span>Live Worker Locations</span>
            {stats?.onDuty != null && (
              <span className="badge badge-active">{stats.onDuty} Online</span>
            )}
          </div>
          <div className="card-body" style={{ height: '400px', padding: 0 }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gray-400)'
            }}>
              Map Component — see Live Tracking page for full implementation.
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-title">
            <span>Recent Activity</span>
          </div>
          <div className="card-body">
            {!recentActivity || recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                No recent activity.
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      <Clock size={18} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.text}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Jobs Table */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">
            <span>Active Jobs</span>
            <button className="btn btn-primary btn-sm">View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="job-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                      No active jobs at the moment.
                    </td>
                  </tr>
                ) : (
                  activeJobs.map(job => (
                    <tr key={job._id}>
                      <td>
                        <div className="worker-cell">
                          <div className="worker-avatar">
                            {job.assignedTo?.name?.charAt(0)}
                          </div>
                          <div className="worker-info">
                            <div className="worker-name">{job.assignedTo?.name}</div>
                            <div className="worker-phone">{job.assignedTo?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>{job.location?.address || '—'}</td>
                      <td>
                        <span className="badge badge-active">{job.status}</span>
                      </td>
                      <td>
                        {job.checkInTime
                          ? new Date(job.checkInTime).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary">Track</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard