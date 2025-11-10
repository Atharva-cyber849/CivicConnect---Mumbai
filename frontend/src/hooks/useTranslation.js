import React from 'react'
import { useTranslation } from 'react-i18next'

// HOC to provide translation functions to any component
export const withTranslation = (namespace = 'common') => (Component) => {
  const WrappedComponent = (props) => {
    const { t, i18n } = useTranslation(namespace)
    
    return (
      <Component 
        {...props} 
        t={t} 
        i18n={i18n}
        currentLanguage={i18n.language}
        isRTL={i18n.dir() === 'rtl'}
      />
    )
  }
  
  WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for Mumbai-specific translations
export const useMumbaiTranslation = () => {
  const { t, i18n } = useTranslation()
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    isMarathi: i18n.language === 'mr',
    isEnglish: i18n.language === 'en',
    
    // Mumbai-specific translation helpers
    translateWard: (wardCode) => {
      return t(`wards.${wardCode}`, { defaultValue: `${wardCode} Ward` })
    },
    
    translateDepartment: (deptCode) => {
      return t(`departments.${deptCode}`, { defaultValue: deptCode })
    },
    
    translateStatus: (status) => {
      return t(`status.${status.toLowerCase()}`, { defaultValue: status })
    },
    
    translateCategory: (category) => {
      return t(`categories.${category.toLowerCase()}`, { defaultValue: category })
    },
    
    translatePriority: (priority) => {
      return t(`priority.${priority.toLowerCase()}`, { defaultValue: priority })
    },
    
    // Format functions with locale support
    formatDate: (date, options = {}) => {
      const locale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        ...options
      }).format(new Date(date))
    },
    
    formatTime: (date, options = {}) => {
      const locale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        ...options
      }).format(new Date(date))
    },
    
    formatCurrency: (amount, options = {}) => {
      const locale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        ...options
      }).format(amount)
    },
    
    formatNumber: (number, options = {}) => {
      const locale = i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
      return new Intl.NumberFormat(locale, options).format(number)
    }
  }
}

// Component for conditional rendering based on language
export const LanguageConditional = ({ 
  en, 
  mr, 
  children, 
  fallback = null 
}) => {
  const { i18n } = useTranslation()
  
  if (i18n.language === 'en' && en) {
    return en
  } else if (i18n.language === 'mr' && mr) {
    return mr
  } else if (children) {
    return children
  } else {
    return fallback
  }
}

// Component for pluralization with language-specific rules
export const Pluralize = ({ 
  count, 
  singular, 
  plural, 
  zero, 
  showCount = true,
  ...props 
}) => {
  const { t, i18n } = useTranslation()
  
  let text = ''
  
  if (count === 0 && zero) {
    text = zero
  } else if (count === 1) {
    text = singular
  } else {
    text = plural || `${singular}s`
  }
  
  // Handle Marathi pluralization rules
  if (i18n.language === 'mr') {
    // Marathi has different pluralization rules
    // This is a simplified version - full implementation would use i18next plural rules
    if (count === 1) {
      text = singular
    } else {
      text = plural || singular
    }
  }
  
  return (
    <span {...props}>
      {showCount && `${count} `}{text}
    </span>
  )
}

// Direction-aware style helper
export const useDirectionStyles = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  
  return {
    isRTL,
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    textAlign: isRTL ? 'text-right' : 'text-left',
    direction: isRTL ? 'rtl' : 'ltr'
  }
}

// Mumbai BMC specific language utilities
export const mumbaiLanguageUtils = {
  // Get localized ward name with full details
  getWardDetails: (wardCode, t) => {
    const wardName = t(`wards.${wardCode}`, { defaultValue: `${wardCode} Ward` })
    const englishName = wardCode === 'A' ? 'Colaba' : 
                       wardCode === 'B' ? 'Dongri' :
                       wardCode === 'C' ? 'Marine Lines' :
                       wardCode // fallback
    
    return {
      code: wardCode,
      name: wardName,
      englishName,
      displayName: wardName
    }
  },
  
  // Get complaint category with icon
  getCategoryDetails: (categoryCode, t) => {
    const categoryName = t(`categories.${categoryCode}`, { defaultValue: categoryCode })
    const icons = {
      roads: '🛣️',
      waste: '🗑️',
      water: '💧',
      electricity: '⚡',
      health: '🏥',
      education: '🎓',
      parks: '🌳',
      buildings: '🏢',
      noise: '🔊',
      others: '📋'
    }
    
    return {
      code: categoryCode,
      name: categoryName,
      icon: icons[categoryCode] || '📋'
    }
  },
  
  // Get status with color coding
  getStatusDetails: (statusCode, t) => {
    const statusName = t(`status.${statusCode}`, { defaultValue: statusCode })
    const colors = {
      submitted: 'blue',
      assigned: 'yellow',
      in_progress: 'orange',
      resolved: 'green',
      closed: 'gray',
      rejected: 'red',
      pending: 'yellow',
      on_hold: 'gray'
    }
    
    return {
      code: statusCode,
      name: statusName,
      color: colors[statusCode] || 'gray'
    }
  }
}

export default {
  withTranslation,
  useMumbaiTranslation,
  LanguageConditional,
  Pluralize,
  useDirectionStyles,
  mumbaiLanguageUtils
}