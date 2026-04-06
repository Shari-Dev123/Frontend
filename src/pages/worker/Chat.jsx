import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import API from '../../api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const WorkerChat = () => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await API.get('/chat/admin')
      setMessages(res.data)
    } catch {}
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      const res = await API.post('/chat/send-to-admin', { message: newMessage })
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
    } catch {
      toast.error('Failed to send message.')
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="card-title" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Message Admin</h2>
        </div>
      </div>

      <div
        className="dashboard-card"
        style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: '3rem' }}>
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No messages yet. Start the conversation with your admin.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender === user?._id || msg.sender?._id === user?._id
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {/* Admin avatar */}
                  {!isMe && (
                    <div className="worker-avatar" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
                      A
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '0.6rem 1rem',
                    borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: isMe ? '#2563eb' : 'var(--gray-100)',
                    color: isMe ? 'white' : 'inherit',
                    fontSize: '0.9rem'
                  }}>
                    <div>{msg.message}</div>
                    <div style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '0.25rem',
                      textAlign: 'right'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-PK', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--gray-200)',
            display: 'flex',
            gap: '0.75rem'
          }}
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
      </div>
    </div>
  )
}

export default WorkerChat