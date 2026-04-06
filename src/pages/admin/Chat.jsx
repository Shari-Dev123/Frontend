import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Search, Circle } from 'lucide-react'
import API from '../../api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const Chat = () => {
  const { user } = useAuthStore()
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => { fetchWorkers() }, [])
  useEffect(() => { if (selectedWorker) fetchMessages(selectedWorker._id) }, [selectedWorker])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchWorkers = async () => {
    try {
      const res = await API.get('/admin/workers')
      setWorkers((res.data.data || res.data).filter(w => w.approved))
    } catch {
      toast.error('Failed to load workers.')
    }
  }

  const fetchMessages = async (workerId) => {
    try {
      const res = await API.get(`/chat/${workerId}`)
      setMessages(res.data.data || res.data)
    } catch {
      setMessages([])
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedWorker) return
    try {
      const res = await API.post('/chat/send', {
        receiverId: selectedWorker._id,
        message: newMessage
      })
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
    } catch {
      toast.error('Failed to send message.')
    }
  }

  const filtered = workers.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Messages</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', height: 'calc(100vh - 200px)' }}>

        {/* Worker List Sidebar */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.6rem',
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
                  padding: '0.5rem 0.75rem 0.5rem 2rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Worker Entries */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                No workers found.
              </div>
            ) : (
              filtered.map(worker => (
                <div
                  key={worker._id}
                  onClick={() => setSelectedWorker(worker)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--gray-100)',
                    background: selectedWorker?._id === worker._id ? '#eff6ff' : 'white'
                  }}
                >
                  <div className="worker-avatar">{worker.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{worker.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Circle
                        size={8}
                        fill={worker.isActive ? '#22c55e' : '#6b7280'}
                        color={worker.isActive ? '#22c55e' : '#6b7280'}
                      />
                      {worker.isActive ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedWorker ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="worker-avatar">{selectedWorker.name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedWorker.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{selectedWorker.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: '2rem' }}>
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender === user?._id || msg.sender?._id === user?._id
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%',
                          padding: '0.6rem 1rem',
                          borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          background: isMe ? '#2563eb' : 'var(--gray-100)',
                          color: isMe ? 'white' : 'inherit',
                          fontSize: '0.9rem'
                        }}>
                          <div>{msg.message}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                style={{ padding: '1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.75rem' }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 1rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            // Empty State
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--gray-400)' }}>
              <MessageSquare size={48} />
              <p>Select a worker to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat