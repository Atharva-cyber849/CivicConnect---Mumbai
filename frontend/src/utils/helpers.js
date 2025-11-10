import { format, formatDistance } from 'date-fns'
import clsx from 'clsx'

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const baseClass = 'badge'
  switch (status) {
    case 'PENDING':
      return clsx(baseClass, 'badge-pending')
    case 'IN_PROGRESS':
      return clsx(baseClass, 'badge-in-progress')
    case 'RESOLVED':
      return clsx(baseClass, 'badge-resolved')
    case 'REJECTED':
      return clsx(baseClass, 'badge-rejected')
    default:
      return baseClass
  }
}

// Get priority badge class
export const getPriorityBadgeClass = (priority) => {
  const baseClass = 'badge'
  switch (priority) {
    case 'LOW':
      return clsx(baseClass, 'bg-gray-100 text-gray-800')
    case 'MEDIUM':
      return clsx(baseClass, 'bg-yellow-100 text-yellow-800')
    case 'HIGH':
      return clsx(baseClass, 'bg-orange-100 text-orange-800')
    case 'URGENT':
      return clsx(baseClass, 'bg-red-100 text-red-800')
    default:
      return baseClass
  }
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Validate phone
export const isValidPhone = (phone) => {
  const regex = /^[0-9]{10}$/
  return regex.test(phone.replace(/\D/g, ''))
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Get initials from name
export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}
