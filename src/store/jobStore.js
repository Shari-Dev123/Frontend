import { create } from 'zustand'
import API from '../api'

export const useJobStore = create((set, get) => ({
  jobs: [],
  currentJob: null,
  stats: null,
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchJobs: async () => {
    set({ isLoading: true })
    try {
      const response = await API.get('/jobs')
      set({ jobs: response.data.data || response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
    }
  },

  fetchDashboardStats: async () => {
    try {
      const response = await API.get('/dashboard/stats')
      const data = response.data.data
      set({
        stats: {
          totalWorkers:     data.totalWorkers,
          activeJobs:       data.activeJobs,
          onDuty:           data.onlineWorkers,
          completedToday:   data.todayAttendance,
          workerChange:     null,
          activeJobsChange: null,
          onDutyChange:     null,
          completedChange:  null,
        }
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  },

  fetchRecentActivity: async () => {
    try {
      const response = await API.get('/dashboard/activity')
      const raw = response.data.data || []
      const activity = raw.map(record => ({
        id:   record._id,
        text: record.worker?.name
          ? `${record.worker.name} checked in${record.job?.title ? ` — ${record.job.title}` : ''}`
          : 'Unknown worker activity',
        time: record.timestamp
          ? new Date(record.timestamp).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
          : '—',
        type: 'checkin'
      }))
      set({ recentActivity: activity })
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await API.post('/jobs', jobData)
      set(state => ({
        jobs: [response.data.data, ...state.jobs]
      }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  updateJobStatus: async (jobId, status, reason) => {
    try {
      const response = await API.put(`/jobs/${jobId}/status`, {
        status,
        rejectionReason: reason
      })
      set(state => ({
        jobs: state.jobs.map(job =>
          job._id === jobId ? response.data.data : job
        ),
        currentJob: response.data.data
      }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message }
    }
  },

  setCurrentJob: (job) => set({ currentJob: job })
}))