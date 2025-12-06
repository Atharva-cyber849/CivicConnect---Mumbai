import React, { useState } from 'react'
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I report a civic issue?',
          a: 'Click on "Report Issue" in the navigation menu, fill in the details about the problem, add photos if available, and mark the location on the map. Your complaint will be automatically routed to the appropriate department.'
        },
        {
          q: 'Do I need to create an account?',
          a: 'Yes, you need to register with your email address and phone number to report issues. This helps us keep you updated about your complaint status and ensures accountability.'
        },
        {
          q: 'Is this service free?',
          a: 'Yes, the Snap & Report Mumbai service is completely free for all citizens. It\'s an initiative by Brihanmumbai Municipal Corporation (BMC) to improve civic services.'
        }
      ]
    },
    {
      category: 'Complaint Status',
      questions: [
        {
          q: 'How long does it take to resolve a complaint?',
          a: 'Resolution time varies based on the type and severity of the issue. Routine complaints typically take 7-15 days, while urgent matters like water supply or sewage issues are prioritized and resolved within 2-5 days.'
        },
        {
          q: 'How can I track my complaint?',
          a: 'Go to "My Complaints" section to view all your submitted complaints. You can see real-time status updates, officer notes, and estimated resolution time.'
        },
        {
          q: 'What do the different status mean?',
          a: 'Open: Complaint received and assigned. In Progress: Officer is working on resolution. Resolved: Issue has been fixed. Rejected: Complaint doesn\'t fall under BMC jurisdiction or lacks necessary information.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'Why can\'t I upload photos?',
          a: 'Ensure your photo is under 5MB and in JPG, PNG, or HEIC format. Also check your browser permissions allow file uploads. If the issue persists, try using a different browser.'
        },
        {
          q: 'Location detection is not working',
          a: 'Make sure you\'ve granted location permissions to your browser. On mobile, check your device settings. You can also manually mark the location on the map if automatic detection fails.'
        },
        {
          q: 'I forgot my password',
          a: 'Click "Forgot Password" on the login page. Enter your registered email address and we\'ll send you a password reset link. The link is valid for 24 hours.'
        }
      ]
    },
    {
      category: 'Complaint Guidelines',
      questions: [
        {
          q: 'What types of issues can I report?',
          a: 'You can report potholes, water supply issues, garbage collection problems, street light failures, illegal construction, sewage problems, tree-related issues, and other civic amenities under BMC jurisdiction.'
        },
        {
          q: 'Can I report on behalf of someone else?',
          a: 'Yes, you can report issues you observe in your community even if they don\'t directly affect you. However, use your own account and provide accurate location details.'
        },
        {
          q: 'What information should I include?',
          a: 'Provide a clear title, detailed description, accurate location, category, and photos if possible. More information helps officers resolve the issue faster.'
        }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      details: '1916 (BMC Helpline)',
      description: '24/7 support for urgent issues',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      details: 'support@mcgm.gov.in',
      description: 'Response within 24 hours',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      details: 'Available Mon-Sat',
      description: '9 AM - 6 PM',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ]

  const resources = [
    {
      icon: DocumentTextIcon,
      title: 'User Guide',
      description: 'Complete guide to using the portal',
      link: '#'
    },
    {
      icon: VideoCameraIcon,
      title: 'Video Tutorials',
      description: 'Step-by-step video instructions',
      link: '#'
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'FAQ',
      description: 'Frequently asked questions',
      link: '#'
    }
  ]

  const filteredFaqs = searchQuery 
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(faq => 
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <QuestionMarkCircleIcon className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-blue-100 mt-1">We're here to help you with any questions</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, idx) => (
          <div key={idx} className={`${method.color} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
            <method.icon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
            <p className="font-bold mb-1">{method.details}</p>
            <p className="text-sm opacity-75">{method.description}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        {filteredFaqs.map((category, catIdx) => (
          <div key={catIdx} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
              <span className="h-2 w-2 bg-blue-600 rounded-full mr-3"></span>
              {category.category}
            </h3>
            <div className="space-y-3">
              {category.questions.map((faq, idx) => {
                const faqId = `${catIdx}-${idx}`
                const isExpanded = expandedFaq === faqId

                return (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="font-medium text-gray-900">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-gray-600 bg-gray-50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No FAQs match your search. Try different keywords.</p>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.link}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <resource.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
        <p className="text-gray-300 mb-6">Our support team is always ready to assist you</p>
        <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Contact Support Team
        </button>
      </div>
    </div>
  )
}

export default Help
