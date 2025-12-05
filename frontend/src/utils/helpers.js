import { format, formatDistance } from 'date-fns'
import clsx from 'clsx'
import { CIVIC_ISSUE_CATEGORIES, DEPARTMENT_ISSUE_MAPPING } from './constants'

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

// ============================================================================
// COMPLAINT CLASSIFICATION & DEPARTMENT ASSIGNMENT UTILITIES
// ============================================================================

/**
 * Get the assigned department for a given issue type
 * Used for automatic complaint routing to the correct department
 * @param {string} issueType - The issue type (e.g., 'POTHOLE', 'GARBAGE_NOT_COLLECTED')
 * @returns {string|null} - Department value/ID or null if not found
 */
export const getAssignedDepartment = (issueType) => {
  if (!issueType) return null
  
  // Search through all departments for matching issue
  for (const [deptValue, deptData] of Object.entries(DEPARTMENT_ISSUE_MAPPING)) {
    if (deptData.issues.includes(issueType)) {
      return deptValue
    }
  }
  
  // Fallback to OTHER if no match found
  return null
}

/**
 * Get the department details (label, icon, SLA) for a given issue type
 * @param {string} issueType - The issue type
 * @returns {object|null} - Department details or null if not found
 */
export const getDepartmentDetailsForIssue = (issueType) => {
  const deptValue = getAssignedDepartment(issueType)
  if (!deptValue || !DEPARTMENT_ISSUE_MAPPING[deptValue]) {
    return null
  }
  
  const deptData = DEPARTMENT_ISSUE_MAPPING[deptValue]
  return {
    value: deptValue,
    label: deptData.label,
    icon: deptData.icon,
    sla: deptData.sla
  }
}

/**
 * Get all issues for a specific category
 * @param {string} categoryKey - The category key (e.g., 'ROADS_TRANSPORT')
 * @returns {array} - Array of issues in the category
 */
export const getIssuesByCategory = (categoryKey) => {
  const category = CIVIC_ISSUE_CATEGORIES[categoryKey]
  return category ? category.issues : []
}

/**
 * Get issue details by issue type
 * @param {string} issueType - The issue type
 * @returns {object|null} - Issue details or null if not found
 */
export const getIssueDetails = (issueType) => {
  for (const category of Object.values(CIVIC_ISSUE_CATEGORIES)) {
    const issue = category.issues.find(i => i.value === issueType)
    if (issue) {
      return issue
    }
  }
  return null
}

/**
 * Get all issue categories with their details
 * @returns {array} - Array of categories with their properties
 */
export const getAllIssueCategories = () => {
  return Object.entries(CIVIC_ISSUE_CATEGORIES).map(([key, category]) => ({
    key,
    label: category.label,
    icon: category.icon,
    color: category.color,
    issueCount: category.issues.length
  }))
}

/**
 * Get SLA (Service Level Agreement) for a given issue type
 * @param {string} issueType - The issue type
 * @returns {object|null} - SLA details (response, resolution times and priority)
 */
export const getSLAForIssue = (issueType) => {
  const deptDetails = getDepartmentDetailsForIssue(issueType)
  return deptDetails ? deptDetails.sla : null
}

/**
 * Get the priority level for a given issue type
 * @param {string} issueType - The issue type
 * @returns {string|null} - Priority level ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
 */
export const getPriorityForIssue = (issueType) => {
  const issue = getIssueDetails(issueType)
  return issue ? issue.priority : null
}

/**
 * Validate that an issue belongs to a specific department
 * @param {string} issueType - The issue type
 * @param {string} departmentValue - The department value to check
 * @returns {boolean} - True if the issue belongs to the department
 */
export const isIssueBelongsToDepartment = (issueType, departmentValue) => {
  const dept = DEPARTMENT_ISSUE_MAPPING[departmentValue]
  return dept ? dept.issues.includes(issueType) : false
}

/**
 * Get all departments that handle a specific issue type
 * (In most cases there's only one, but this is useful for edge cases)
 * @param {string} issueType - The issue type
 * @returns {array} - Array of department values that handle this issue
 */
export const getDepartmentsThatHandleIssue = (issueType) => {
  const departments = []
  for (const [deptValue, deptData] of Object.entries(DEPARTMENT_ISSUE_MAPPING)) {
    if (deptData.issues.includes(issueType)) {
      departments.push(deptValue)
    }
  }
  return departments
}

