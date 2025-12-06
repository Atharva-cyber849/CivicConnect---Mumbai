/**
 * Analytics Utilities for Data Processing and Visualization
 */

/**
 * Calculate metrics for a complaints dataset
 * @param {Array} complaints - Array of complaint objects
 * @returns {Object} Calculated metrics
 */
export const calculateMetrics = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return {
      total: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      avgResolutionTime: 0,
      slaAdherence: 0,
      resolutionRate: 0,
      avgResponseTime: 0,
    }
  }

  const total = complaints.length
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length
  const pending = complaints.filter(c => c.status === 'PENDING').length
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length

  // Calculate average resolution time
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED')
  const avgResolutionTime =
    resolvedComplaints.length > 0
      ? resolvedComplaints.reduce((sum, c) => {
          const resolutionTime =
            (new Date(c.resolved_at || Date.now()) -
              new Date(c.created_at)) /
            (1000 * 60 * 60 * 24)
          return sum + resolutionTime
        }, 0) / resolvedComplaints.length
      : 0

  // Calculate response time (from created to first update)
  const avgResponseTime =
    complaints.length > 0
      ? complaints.reduce((sum, c) => {
          const responseTime =
            (new Date(c.updated_at || c.created_at) -
              new Date(c.created_at)) /
            (1000 * 60 * 60)
          return sum + responseTime
        }, 0) / complaints.length
      : 0

  return {
    total,
    resolved,
    pending,
    inProgress,
    avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1)),
    slaAdherence: parseFloat(((resolved / total) * 100).toFixed(1)),
    resolutionRate: parseFloat(((resolved / total) * 100).toFixed(1)),
    avgResponseTime: parseFloat(avgResponseTime.toFixed(1)),
  }
}

/**
 * Group complaints by a specific field
 * @param {Array} complaints - Array of complaint objects
 * @param {string} field - Field to group by (category, department, status, etc.)
 * @returns {Array} Array of {name, value} objects
 */
export const groupComplaints = (complaints, field) => {
  const grouped = {}

  complaints.forEach(complaint => {
    const key = complaint[field] || 'Unknown'
    grouped[key] = (grouped[key] || 0) + 1
  })

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Get complaints grouped by date
 * @param {Array} complaints - Array of complaint objects
 * @param {string} dateField - Which date field to use (created_at, resolved_at, etc.)
 * @returns {Array} Array of {date, count} objects
 */
export const getComplaintsByDate = (complaints, dateField = 'created_at') => {
  const grouped = {}

  complaints.forEach(complaint => {
    const date = new Date(complaint[dateField])
      .toISOString()
      .split('T')[0]
    grouped[date] = (grouped[date] || 0) + 1
  })

  return Object.entries(grouped)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Get department performance metrics
 * @param {Array} complaints - Array of complaint objects
 * @returns {Array} Array of department performance objects
 */
export const getDepartmentPerformance = (complaints) => {
  const depts = {}

  complaints.forEach(complaint => {
    const dept = complaint.department || 'Unassigned'
    if (!depts[dept]) {
      depts[dept] = {
        name: dept,
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
        avgTime: 0,
      }
    }
    depts[dept].total += 1

    if (complaint.status === 'RESOLVED') {
      depts[dept].resolved += 1
    } else if (complaint.status === 'PENDING') {
      depts[dept].pending += 1
    } else if (complaint.status === 'IN_PROGRESS') {
      depts[dept].inProgress += 1
    }
  })

  return Object.values(depts)
    .map(dept => ({
      ...dept,
      resolutionRate: parseFloat(
        ((dept.resolved / dept.total) * 100).toFixed(1)
      ),
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Get category performance metrics
 * @param {Array} complaints - Array of complaint objects
 * @returns {Array} Array of category performance objects
 */
export const getCategoryPerformance = (complaints) => {
  const categories = {}

  complaints.forEach(complaint => {
    const cat = complaint.category || 'Other'
    if (!categories[cat]) {
      categories[cat] = {
        name: cat,
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
      }
    }
    categories[cat].total += 1

    if (complaint.status === 'RESOLVED') {
      categories[cat].resolved += 1
    } else if (complaint.status === 'PENDING') {
      categories[cat].pending += 1
    } else if (complaint.status === 'IN_PROGRESS') {
      categories[cat].inProgress += 1
    }
  })

  return Object.values(categories)
    .map(cat => ({
      ...cat,
      resolutionRate: parseFloat(
        ((cat.resolved / cat.total) * 100).toFixed(1)
      ),
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Get ward performance metrics
 * @param {Array} complaints - Array of complaint objects
 * @returns {Array} Array of ward performance objects
 */
export const getWardPerformance = (complaints) => {
  const wards = {}

  complaints.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    if (!wards[ward]) {
      wards[ward] = {
        name: ward,
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
      }
    }
    wards[ward].total += 1

    if (complaint.status === 'RESOLVED') {
      wards[ward].resolved += 1
    } else if (complaint.status === 'PENDING') {
      wards[ward].pending += 1
    } else if (complaint.status === 'IN_PROGRESS') {
      wards[ward].inProgress += 1
    }
  })

  return Object.values(wards)
    .map(ward => ({
      ...ward,
      resolutionRate: parseFloat(
        ((ward.resolved / ward.total) * 100).toFixed(1)
      ),
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Get priority distribution
 * @param {Array} complaints - Array of complaint objects
 * @returns {Array} Array of {priority, count, percentage} objects
 */
export const getPriorityDistribution = (complaints) => {
  const priorities = {}
  const total = complaints.length

  complaints.forEach(complaint => {
    const priority = complaint.priority || 'MEDIUM'
    priorities[priority] = (priorities[priority] || 0) + 1
  })

  return Object.entries(priorities)
    .map(([priority, count]) => ({
      priority,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => {
      const order = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
      return (order[a.priority] || 5) - (order[b.priority] || 5)
    })
}

/**
 * Get status distribution
 * @param {Array} complaints - Array of complaint objects
 * @returns {Array} Array of {status, count, percentage} objects
 */
export const getStatusDistribution = (complaints) => {
  const statuses = {}
  const total = complaints.length

  complaints.forEach(complaint => {
    const status = complaint.status || 'PENDING'
    statuses[status] = (statuses[status] || 0) + 1
  })

  return Object.entries(statuses)
    .map(([status, count]) => ({
      status,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Filter complaints by multiple criteria
 * @param {Array} complaints - Array of complaint objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered complaints
 */
export const filterComplaints = (complaints, filters = {}) => {
  return complaints.filter(complaint => {
    if (
      filters.startDate &&
      new Date(complaint.created_at) < new Date(filters.startDate)
    ) {
      return false
    }
    if (
      filters.endDate &&
      new Date(complaint.created_at) > new Date(filters.endDate)
    ) {
      return false
    }
    if (filters.category && complaint.category !== filters.category) {
      return false
    }
    if (filters.department && complaint.department !== filters.department) {
      return false
    }
    if (filters.status && complaint.status !== filters.status) {
      return false
    }
    if (filters.priority && complaint.priority !== filters.priority) {
      return false
    }
    if (filters.ward && complaint.ward !== filters.ward) {
      return false
    }
    return true
  })
}

/**
 * Export complaints to CSV
 * @param {Array} complaints - Array of complaint objects
 * @param {string} filename - Output filename
 */
export const exportToCSV = (complaints, filename = 'complaints.csv') => {
  if (!complaints || complaints.length === 0) {
    console.warn('No complaints to export')
    return
  }

  const headers = [
    'ID',
    'Title',
    'Category',
    'Department',
    'Ward',
    'Priority',
    'Status',
    'Created At',
    'Resolved At',
    'Description',
  ]

  const rows = complaints.map(complaint => [
    complaint.id || '',
    complaint.title || '',
    complaint.category || '',
    complaint.department || '',
    complaint.ward || '',
    complaint.priority || '',
    complaint.status || '',
    new Date(complaint.created_at).toISOString(),
    complaint.resolved_at
      ? new Date(complaint.resolved_at).toISOString()
      : '',
    complaint.description?.replace(/"/g, '""') || '',
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell}"`
          }
          return cell
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Get trending data (complaints increasing/decreasing)
 * @param {Array} complaints - Array of complaint objects
 * @param {number} days - Number of days to compare
 * @returns {Object} Trend data
 */
export const getTrendingData = (complaints, days = 7) => {
  const now = new Date()
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const pastComplaints = complaints.filter(
    c => new Date(c.created_at) < now && new Date(c.created_at) >= pastDate
  )

  const futureComplaints = complaints.filter(
    c => new Date(c.created_at) >= now && new Date(c.created_at) < futureDate
  )

  const change = futureComplaints.length - pastComplaints.length
  const percentChange =
    pastComplaints.length > 0
      ? parseFloat(((change / pastComplaints.length) * 100).toFixed(1))
      : 0

  return {
    pastCount: pastComplaints.length,
    currentCount: futureComplaints.length,
    change,
    percentChange,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
  }
}
