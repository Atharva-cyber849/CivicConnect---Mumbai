/**
 * Geospatial Analysis Utilities
 * Provides functions for analyzing complaint data across wards
 * Used for generating analytics dashboards and trend reports
 */

import { differenceInDays } from 'date-fns'
import { getWardBoundaries, calculateDistance } from './mapUtils'

/**
 * Analyze category distribution across wards
 * Returns: { wardCode: { category: count } }
 */
export const analyzeCategoriesByWard = (complaints) => {
  const analysis = {}

  complaints.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    if (!analysis[ward]) {
      analysis[ward] = {}
    }

    const category = complaint.category || 'OTHER'
    analysis[ward][category] = (analysis[ward][category] || 0) + 1
  })

  return analysis
}

/**
 * Get most reported categories across all wards
 * Returns: [ { category, count, percentage, topWards } ]
 */
export const getMostReportedCategories = (complaints) => {
  const categoryMap = {}

  complaints.forEach(complaint => {
    const category = complaint.category || 'OTHER'
    if (!categoryMap[category]) {
      categoryMap[category] = { count: 0, wards: [] }
    }
    categoryMap[category].count++
    if (!categoryMap[category].wards.includes(complaint.ward)) {
      categoryMap[category].wards.push(complaint.ward)
    }
  })

  const total = complaints.length
  return Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      topWards: data.wards.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Analyze response time by ward
 * Returns: { wardCode: { avgDays, total, resolved, medianDays } }
 */
export const analyzeResponseTimeByWard = (complaints) => {
  const wardData = {}

  complaints.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    if (!wardData[ward]) {
      wardData[ward] = {
        resolved: [],
        total: 0,
      }
    }

    wardData[ward].total++

    if (complaint.status === 'RESOLVED') {
      const created = new Date(complaint.created_at)
      const resolved = new Date(complaint.resolved_at || complaint.updated_at)
      const days = differenceInDays(resolved, created)
      wardData[ward].resolved.push(days)
    }
  })

  // Calculate statistics
  const analysis = {}
  Object.entries(wardData).forEach(([ward, data]) => {
    const resolved = data.resolved
    analysis[ward] = {
      total: data.total,
      resolved: resolved.length,
      avgDays: resolved.length > 0 ? Math.round(resolved.reduce((a, b) => a + b, 0) / resolved.length) : 0,
      medianDays:
        resolved.length > 0 ? resolved.sort((a, b) => a - b)[Math.floor(resolved.length / 2)] : 0,
      resolutionRate: data.total > 0 ? Math.round((resolved.length / data.total) * 100) : 0,
    }
  })

  return analysis
}

/**
 * Identify complaint density hotspots in a ward
 * Returns: [ { center: {lat, lng}, count, intensity } ]
 */
export const identifyHotspots = (complaints, radiusKm = 0.5) => {
  const hotspots = []
  const clustered = new Set()

  complaints.forEach((complaint, index) => {
    if (clustered.has(index) || !complaint.latitude || !complaint.longitude) return

    const nearby = complaints.filter((other, otherIndex) => {
      if (otherIndex === index || clustered.has(otherIndex)) return false
      if (!other.latitude || !other.longitude) return false

      const distance = calculateDistance(
        complaint.latitude,
        complaint.longitude,
        other.latitude,
        other.longitude
      )
      return distance <= radiusKm
    })

    if (nearby.length >= 2) {
      // At least 3 total (including original)
      const center = {
        lat:
          (complaint.latitude + nearby.reduce((sum, c) => sum + (c.latitude || 0), 0)) /
          (nearby.length + 1),
        lng:
          (complaint.longitude + nearby.reduce((sum, c) => sum + (c.longitude || 0), 0)) /
          (nearby.length + 1),
      }

      const allComplaints = [complaint, ...nearby]
      const pendingCount = allComplaints.filter(c => c.status === 'PENDING').length
      const intensity = (pendingCount / allComplaints.length) * (allComplaints.length / 10)

      hotspots.push({
        center,
        count: allComplaints.length,
        pendingCount,
        intensity: Math.min(intensity, 1.0),
        complaints: allComplaints,
      })

      clustered.add(index)
      nearby.forEach((_, i) => {
        const actualIndex = complaints.indexOf(nearby[i])
        if (actualIndex !== -1) clustered.add(actualIndex)
      })
    }
  })

  return hotspots.sort((a, b) => b.count - a.count)
}

/**
 * Analyze complaint status distribution by ward
 * Returns: { wardCode: { PENDING, IN_PROGRESS, RESOLVED, REJECTED } }
 */
export const analyzeStatusByWard = (complaints) => {
  const analysis = {}

  complaints.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    if (!analysis[ward]) {
      analysis[ward] = {
        PENDING: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        REJECTED: 0,
      }
    }

    analysis[ward][complaint.status || 'PENDING']++
  })

  return analysis
}

/**
 * Get ward performance metrics
 * Returns: [ { ward, total, pending, resolved, avgResponseTime, resolutionRate } ]
 */
export const getWardPerformanceMetrics = (complaints) => {
  const responseTime = analyzeResponseTimeByWard(complaints)
  const statusByWard = analyzeStatusByWard(complaints)

  return Object.entries(responseTime)
    .map(([ward, data]) => ({
      ward,
      ...data,
      ...statusByWard[ward],
    }))
    .sort((a, b) => b.resolutionRate - a.resolutionRate)
}

/**
 * Calculate complaint density map data for heatmap visualization
 * Returns: [ [lat, lng, intensity], ... ]
 */
export const calculateDensityMapData = (complaints) => {
  return complaints
    .filter(c => c.latitude && c.longitude)
    .map(c => {
      let intensity = 0.5 // Base intensity

      // Weight by status
      if (c.status === 'PENDING') intensity = 1.0
      else if (c.status === 'IN_PROGRESS') intensity = 0.8
      else if (c.status === 'RESOLVED') intensity = 0.3
      else if (c.status === 'REJECTED') intensity = 0.1

      // Weight by priority
      if (c.priority === 'URGENT') intensity = Math.min(intensity + 0.2, 1.0)
      else if (c.priority === 'HIGH') intensity = Math.min(intensity + 0.1, 1.0)

      return [c.latitude, c.longitude, intensity]
    })
}

/**
 * Analyze pending complaints by ward
 * Returns sorted array of wards with pending counts
 */
export const analyzePendingByWard = (complaints) => {
  const pending = complaints.filter(c => c.status === 'PENDING')

  const wardMap = {}
  pending.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    wardMap[ward] = (wardMap[ward] || 0) + 1
  })

  return Object.entries(wardMap)
    .map(([ward, count]) => ({ ward, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get category distribution for a specific ward
 * Returns: [ { category, count, percentage } ]
 */
export const getWardCategoryDistribution = (complaints, wardCode) => {
  const wardComplaints = complaints.filter(c => c.ward === wardCode)
  const categoryMap = {}

  wardComplaints.forEach(complaint => {
    const category = complaint.category || 'OTHER'
    categoryMap[category] = (categoryMap[category] || 0) + 1
  })

  const total = wardComplaints.length
  return Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Calculate average complaint age by ward
 * Returns: { wardCode: ageDays }
 */
export const calculateComplaintAgeByWard = (complaints) => {
  const now = new Date()
  const wardAges = {}

  complaints.forEach(complaint => {
    const ward = complaint.ward || 'Unknown'
    if (!wardAges[ward]) {
      wardAges[ward] = { total: 0, sumDays: 0, count: 0 }
    }

    wardAges[ward].total++
    wardAges[ward].count++
    wardAges[ward].sumDays += differenceInDays(now, new Date(complaint.created_at))
  })

  const analysis = {}
  Object.entries(wardAges).forEach(([ward, data]) => {
    analysis[ward] = {
      avgAgeDays: Math.round(data.sumDays / data.count),
      totalComplaints: data.total,
    }
  })

  return analysis
}

/**
 * Identify at-risk complaints (old pending complaints)
 * Returns: [ complaint, ... ]
 */
export const identifyAtRiskComplaints = (complaints, thresholdDays = 30) => {
  return complaints
    .filter(c => c.status === 'PENDING')
    .map(c => ({
      ...c,
      ageDays: differenceInDays(new Date(), new Date(c.created_at)),
    }))
    .filter(c => c.ageDays >= thresholdDays)
    .sort((a, b) => b.ageDays - a.ageDays)
}

/**
 * Generate comprehensive ward analysis report
 * Returns: Full analytics object with all metrics
 */
export const generateWardAnalysisReport = (complaints) => {
  return {
    summary: {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'PENDING').length,
      inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved: complaints.filter(c => c.status === 'RESOLVED').length,
      rejected: complaints.filter(c => c.status === 'REJECTED').length,
    },
    byWard: getWardPerformanceMetrics(complaints),
    responseTime: analyzeResponseTimeByWard(complaints),
    categories: getMostReportedCategories(complaints),
    hotspots: identifyHotspots(complaints),
    atRisk: identifyAtRiskComplaints(complaints),
    categoryByWard: analyzeCategoriesByWard(complaints),
    densityMap: calculateDensityMapData(complaints),
  }
}

export default {
  analyzeCategoriesByWard,
  getMostReportedCategories,
  analyzeResponseTimeByWard,
  identifyHotspots,
  analyzeStatusByWard,
  getWardPerformanceMetrics,
  calculateDensityMapData,
  analyzePendingByWard,
  getWardCategoryDistribution,
  calculateComplaintAgeByWard,
  identifyAtRiskComplaints,
  generateWardAnalysisReport,
}
