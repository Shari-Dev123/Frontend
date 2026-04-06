import { useEffect } from 'react'
import { Briefcase, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useJobStore } from '../../store/jobStore'

const statusColors = {
  pending:   { background: '#fef9c3', color: '#854d0e' },
  active:    { background: '#dcfce7', color: '#166534' },
  completed: { background: '#dbeafe', color: '#1e40af' },
  cancelled: { background: '#fee2e2', color: '#dc2626' },
}

const MyJobs = () => {
  const { user } = useAuthStore()
  const { jobs, fetchJobs } = useJobStore()
  const navigate = useNavigate()

  useEffect(() => { fetchJobs() }, [])

  const myJobs = jobs.filter(j =>
    j.assignedTo?._id === user?._id || j.assignedTo === user?._id
  )

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>My Jobs</h2>
        </div>
        <span className="badge badge-active">{myJobs.length} Total</span>
      </div>

      {/* Empty State */}
      {myJobs.length === 0 ? (
        <div className="dashboard-card">
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
            <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No jobs have been assigned to you yet.</p>
          </div>
        </div>
      ) : (
        // Job Cards
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myJobs.map(job => (
            <div
              key={job._id}
              className="dashboard-card"
              style={{ cursor: job.status === 'active' ? 'pointer' : 'default' }}
              onClick={() => job.status === 'active' && navigate(`/worker/checkin/${job._id}`)}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Title & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{job.title}</h3>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        ...statusColors[job.status]
                      }}>
                        {job.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ margin: '0 0 0.75rem', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                      {job.description}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-400)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} />
                        {job.location?.address || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} />
                        {job.scheduledDate
                          ? new Date(job.scheduledDate).toLocaleDateString()
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {job.status === 'active' && (
                    <div style={{ color: '#2563eb' }}>
                      <ChevronRight size={20} />
                    </div>
                  )}
                </div>

                {/* Check In / Out Action */}
                {job.status === 'active' && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={e => {
                        e.stopPropagation()
                        navigate(`/worker/checkin/${job._id}`)
                      }}
                    >
                      Check In / Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyJobs