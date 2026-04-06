import { useState, useEffect } from 'react'
import { Briefcase, Plus, Search, Edit, Trash2, MapPin } from 'lucide-react'
import API from '../../api'
import toast from 'react-hot-toast'

const statusColors = {
  pending:   { background: '#fef9c3', color: '#854d0e' },
  active:    { background: '#dcfce7', color: '#166534' },
  completed: { background: '#dbeafe', color: '#1e40af' },
  cancelled: { background: '#fee2e2', color: '#dc2626' },
}

const defaultForm = {
  title: '',
  description: '',
  location: '',
  assignedTo: '',
  scheduledDate: '',
  status: 'pending'
}

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    fetchJobs()
    fetchWorkers()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs')
      setJobs(res.data.data || res.data)
    } catch {
      toast.error('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkers = async () => {
    try {
      const res = await API.get('/admin/workers')
      setWorkers((res.data.data || res.data).filter(w => w.approved))
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedJob) {
        await API.put(`/jobs/${selectedJob._id}`, form)
        toast.success('Job updated successfully.')
      } else {
        await API.post('/jobs', form)
        toast.success('Job created successfully.')
      }
      closeModal()
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await API.delete(`/jobs/${id}`)
      toast.success('Job deleted successfully.')
      fetchJobs()
    } catch {
      toast.error('Failed to delete job.')
    }
  }

  const openEdit = (job) => {
    setSelectedJob(job)
    setForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location?.address || '',
      assignedTo: job.assignedTo?._id || '',
      scheduledDate: job.scheduledDate ? job.scheduledDate.substring(0, 10) : '',
      status: job.status || 'pending'
    })
    setShowModal(true)
  }

  const openCreate = () => {
    setSelectedJob(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedJob(null)
    setForm(defaultForm)
  }

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Jobs</h2>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Job
        </button>
      </div>

      {/* Search */}
      <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
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
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              Loading jobs...
            </div>
          ) : (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(job => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                          {job.description?.substring(0, 40)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={14} style={{ color: 'var(--gray-400)' }} />
                          {job.location?.address || '—'}
                        </div>
                      </td>
                      <td>
                        {job.assignedTo ? (
                          <div className="worker-cell">
                            <div className="worker-avatar">{job.assignedTo.name?.charAt(0)}</div>
                            <span>{job.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {job.scheduledDate
                          ? new Date(job.scheduledDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          ...statusColors[job.status]
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(job)}>
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.3rem 0.6rem',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleDelete(job._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem', fontWeight: 700 }}>
              {selectedJob ? 'Edit Job' : 'Create New Job'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Location */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Location <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Scheduled Date */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Assign Worker */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Assign Worker
                </label>
                <select
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">— Select Worker —</option>
                  {workers.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Status (edit only) */}
              {selectedJob && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  >
                    {['pending', 'active', 'completed', 'cancelled'].map(s => (
                      <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Jobs