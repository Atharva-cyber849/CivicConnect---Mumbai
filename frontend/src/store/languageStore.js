import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import translations from '../locales/translations'

const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'en', // default language
      translations: translations.en,

      // Set language
      setLanguage: (lang) => {
        const validLang = ['en', 'mr'].includes(lang) ? lang : 'en'
        set({
          language: validLang,
          translations: translations[validLang],
        })
      },

      // Get translation by key
      t: (key, params = {}) => {
        const { translations } = get()
        let text = translations[key] || key

        // Replace parameters in translation
        // Example: t('minLength', { min: 8 }) => "Must be at least 8 characters"
        Object.keys(params).forEach((param) => {
          text = text.replace(`{${param}}`, params[param])
        })

        return text
      },

      // Toggle language (switch between en and mr)
      toggleLanguage: () => {
        const { language } = get()
        const newLang = language === 'en' ? 'mr' : 'en'
        set({
          language: newLang,
          translations: translations[newLang],
        })
      },
    }),
    {
      name: 'language-storage', // localStorage key
      getStorage: () => localStorage,
    }
  )
)

export default useLanguageStore
