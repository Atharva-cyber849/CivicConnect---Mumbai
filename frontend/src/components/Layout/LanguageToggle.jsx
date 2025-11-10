import useLanguageStore from '../../store/languageStore'
import { LANGUAGES } from '../../utils/constants'

const LanguageToggle = ({ className = '' }) => {
  const { language, setLanguage } = useLanguageStore()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          onClick={() => setLanguage(lang.value)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              language === lang.value
                ? 'bg-civic-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          title={`Switch to ${lang.label}`}
        >
          <span className="mr-1">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle
