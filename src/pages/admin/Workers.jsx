import { useState, useEffect } from 'react'
import { Users, Plus, Search, Edit, Trash2, CheckCircle } from 'lucide-react'
import API from '../../api'
import toast from 'react-hot-toast'

const defaultForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  cnic: ''
}

const Workers = () => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { fetchWorkers() }, [])

  const fetchWorkers = async () => {
    try {
      const res = await API.get('/admin/workers')
      setWorkers(res.data.data || res.data)
    } catch {
      toast.error('Failed to load workers.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
       await API.post(`/admin/workers/${id}/approve`) 
      toast.success('Worker approved successfully.')
      fetchWorkers()
    } catch {
      toast.error('Failed to approve worker.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this worker?')) return
    try {
      await API.delete(`/admin/workers/${id}`)
      toast.success('Worker deleted successfully.')
      fetchWorkers()
    } catch {
      toast.error('Failed to delete worker.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedWorker) {
        await API.put(`/admin/workers/${selectedWorker._id}`, form)
        toast.success('Worker updated successfully.')
      } else {
        await API.post('/admin/workers', { ...form, role: 'field_worker' })
        toast.success('Worker added successfully.')
      }
      closeModal()
      fetchWorkers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.')
    }
  }

  const openEdit = (worker) => {
    setSelectedWorker(worker)
    setForm({
      name: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      cnic: worker.cnic || '',
      password: ''
    })
    setShowModal(true)
  }

  const openCreate = () => {
    setSelectedWorker(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedWorker(null)
    setForm(defaultForm)
  }

  const filtered = workers.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Workers</h2>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Worker
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
              placeholder="Search workers..."
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

      {/* Workers Table */}
      <div className="dashboard-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              Loading workers...
            </div>
          ) : (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                      No workers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(worker => (
                    <tr key={worker._id}>
                      <td>
                        <div className="worker-cell">
                          <div className="worker-avatar">{worker.name?.charAt(0)}</div>
                          <div className="worker-info">
                            <div className="worker-name">{worker.name}</div>
                            <div className="worker-phone">{worker.cnic || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{worker.email}</td>
                      <td>{worker.phone || '—'}</td>
                      <td>
                        <span className={`badge ${worker.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {worker.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {worker.status === 'approved' ? (
  <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
    <CheckCircle size={12} /> Approved
  </span>
) : (
  <button className="btn btn-sm btn-primary" onClick={() => handleApprove(worker._id)}>
    Approve
  </button>
)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(worker)}>
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
                            onClick={() => handleDelete(worker._id)}
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
            maxWidth: '480px'
          }}>
            <h3 style={{ margin: '0 0 1.5rem', fontWeight: 700 }}>
              {selectedWorker ? 'Edit Worker' : 'Add New Worker'}
            </h3>

            <form onSubmit={handleSubmit}>
              {[
                { label: 'Full Name',  key: 'name',     type: 'text',     required: true },
                { label: 'Email',      key: 'email',    type: 'email',    required: true },
                { label: 'Password',   key: 'password', type: 'password', required: !selectedWorker },
                { label: 'Phone',      key: 'phone',    type: 'text',     required: false },
                { label: 'CNIC',       key: 'cnic',     type: 'text',     required: false }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    {field.label}
                    {field.required && <span style={{ color: '#dc2626' }}> *</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedWorker ? 'Update Worker' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workers