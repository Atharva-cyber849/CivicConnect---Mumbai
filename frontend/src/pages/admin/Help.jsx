import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';

const AdminHelp = () => {
  const { user } = useAuth();
  const role = useRole();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Dashboard & Navigation',
      questions: [
        {
          q: 'How do I access different sections of the admin dashboard?',
          a: 'Use the sidebar on the left to navigate between Dashboard, Complaints, Map View, Analytics, Reports, and other sections. Your available menu items depend on your admin role (Super Admin, Department Admin, or Ward Admin).'
        },
        {
          q: 'What do the different badge numbers mean?',
          a: 'Badge numbers on menu items show pending actions: Super Admins see pending registration requests, Department Admins see unassigned complaints in their department, and Ward Admins see pending complaints in their ward.'
        },
        {
          q: 'How do I minimize or expand the sidebar?',
          a: 'Click the arrow button at the top of the sidebar to toggle between expanded and minimized views. The minimized view saves screen space while keeping icons visible.'
        }
      ]
    },
    {
      category: 'Complaint Management',
      questions: [
        {
          q: 'How do I assign a complaint to an officer?',
          a: 'Go to the Complaints page, click on a complaint to view details, then click "Assign Officer" button. Select an available officer from your department/ward and add assignment notes if needed.'
        },
        {
          q: 'Can I update complaint status?',
          a: 'Yes. Open the complaint details and use the status dropdown to change between Pending, In Progress, Resolved, or Rejected. Add remarks explaining the status change for transparency.'
        },
        {
          q: 'How do I filter complaints?',
          a: 'Use the filter controls at the top of the Complaints page to filter by status, category, priority, date range, ward, or department. You can combine multiple filters for precise results.'
        },
        {
          q: 'What is the SLA Dashboard?',
          a: 'The SLA (Service Level Agreement) Dashboard tracks complaint resolution time against target deadlines. Red indicators show overdue complaints, yellow shows approaching deadlines, and green shows on-time resolutions.'
        }
      ]
    },
    {
      category: 'User & Officer Management',
      questions: [
        {
          q: 'How do I approve registration requests? (Super Admin)',
          a: 'Navigate to User Management from the sidebar. Review pending registration requests and click Approve or Reject. Approved users will receive email confirmation with login credentials.'
        },
        {
          q: 'How do I add a new department admin? (Super Admin)',
          a: 'Go to User Management > Create Dept Admin tab. Fill in the admin\'s details, assign them to a specific department, and submit. They will receive an invitation email.'
        },
        {
          q: 'How do I manage officers in my department? (Dept Admin)',
          a: 'Access Department Officers from the sidebar. Here you can view officer workload, activate/deactivate officers, reset passwords, and send invitation emails to new officers.'
        },
        {
          q: 'Can I view officer performance metrics?',
          a: 'Yes. Go to the Officers page to see each officer\'s assigned complaints, resolution rate, average resolution time, and pending workload. Use this data for performance reviews.'
        }
      ]
    },
    {
      category: 'Reports & Analytics',
      questions: [
        {
          q: 'What reports can I generate?',
          a: 'You can generate department performance reports, ward-wise analytics, category trend reports, resolution time analysis, and citizen satisfaction reports. Select date ranges and export as PDF or Excel.'
        },
        {
          q: 'How do I use the Map View?',
          a: 'The Map View shows geographic distribution of complaints. Click markers to see complaint details. Use layer controls to filter by status, category, or department. Helps identify complaint hotspots.'
        },
        {
          q: 'What is the Analytics dashboard?',
          a: 'Analytics provides visual charts and graphs showing complaint trends, resolution patterns, peak hours, category distribution, and comparative analysis across wards or departments.'
        }
      ]
    },
    {
      category: 'Access & Permissions',
      questions: [
        {
          q: 'What can Super Admins do?',
          a: 'Super Admins have full system access: manage all users, view all complaints city-wide, create department/ward admins, access all wards and departments, configure system settings, and generate system-wide reports.'
        },
        {
          q: 'What can Department Admins do?',
          a: 'Department Admins manage their specific department: view department complaints, assign officers, manage department staff, track department performance, and generate department reports. Cannot access other departments.'
        },
        {
          q: 'What can Ward Admins do?',
          a: 'Ward Admins manage their assigned ward(s): view ward complaints, coordinate with officers, track ward statistics, manage citizen queries, and generate ward reports. Access is limited to assigned ward(s).'
        },
        {
          q: 'Why can\'t I access certain pages?',
          a: 'Page access is role-based. If you see "Access Denied", the page is restricted to higher admin tiers. Contact a Super Admin if you believe you need additional permissions.'
        }
      ]
    },
    {
      category: 'Best Practices',
      questions: [
        {
          q: 'How often should I check pending complaints?',
          a: 'Check the dashboard at least 2-3 times daily. Urgent complaints (marked with high priority) should be addressed immediately. Enable browser notifications for real-time alerts.'
        },
        {
          q: 'What information should I add when assigning complaints?',
          a: 'Always add assignment notes explaining why this officer was chosen, any special instructions, and expected timeline. This helps officers understand priorities and context.'
        },
        {
          q: 'How do I ensure SLA compliance?',
          a: 'Monitor the SLA Dashboard daily, prioritize complaints approaching deadlines, assign experienced officers to urgent matters, and follow up regularly on in-progress complaints.'
        },
        {
          q: 'What should I do with duplicate complaints?',
          a: 'Mark duplicate complaints as "Rejected" with status reason "Duplicate of #[original complaint ID]". This maintains data integrity and prevents double work.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'The page is loading slowly. What should I do?',
          a: 'Clear your browser cache, ensure stable internet connection, and try using Chrome or Firefox. If issues persist, reduce the date range filter to load less data at once.'
        },
        {
          q: 'I can\'t see recent complaints',
          a: 'Click the refresh icon or press Ctrl+R (Cmd+R on Mac) to reload data. The system auto-refreshes every 30 seconds, but manual refresh ensures latest data.'
        },
        {
          q: 'How do I export data?',
          a: 'Most pages have an Export button (usually top-right). Choose your format (Excel/PDF), select date range, and click Export. Files download to your default browser download folder.'
        },
        {
          q: 'I forgot my admin password',
          a: 'Click "Forgot Password" on the login page. Enter your admin email and follow the reset link sent to you. Contact IT support if you don\'t receive the email within 5 minutes.'
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: 'IT Support',
      details: '1916 Ext. 500',
      description: 'Technical assistance for admins',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      icon: EnvelopeIcon,
      title: 'Admin Support',
      details: 'admin.support@mcgm.gov.in',
      description: 'For access and permission issues',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      details: 'Available 9 AM - 6 PM',
      description: 'Instant help from support team',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      icon: DocumentTextIcon,
      title: 'Documentation',
      details: 'Admin Guide & Manuals',
      description: 'Detailed admin procedures',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const quickLinks = [
    {
      title: 'Video Tutorials',
      icon: VideoCameraIcon,
      description: 'Watch step-by-step guides',
      link: '#'
    },
    {
      title: 'Admin Manual',
      icon: DocumentTextIcon,
      description: 'Download complete handbook',
      link: '#'
    },
    {
      title: 'System Status',
      icon: ShieldCheckIcon,
      description: 'Check server health',
      link: '#'
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === '' || 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
              <QuestionMarkCircleIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get assistance with managing the BMC Admin Portal
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              {role.isSuperAdmin && <><ShieldCheckIcon className="h-5 w-5 text-indigo-600" /> Super Admin</>}
              {role.isExactlyDeptAdmin && <><BuildingOffice2Icon className="h-5 w-5 text-orange-600" /> Department Admin</>}
              {role.isExactlyWardAdmin && <><UserGroupIcon className="h-5 w-5 text-green-600" /> Ward Admin</>}
            </span>
            <span>•</span>
            <span>{user?.email}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <div key={index} className={`${method.color} border-2 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
              <method.icon className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">{method.title}</h3>
              <p className="font-semibold mb-2">{method.details}</p>
              <p className="text-sm opacity-80">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.link}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <link.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 transition-colors mb-3" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{link.title}</h3>
              <p className="text-gray-600">{link.description}</p>
            </a>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = `${categoryIndex}-${faqIndex}`;
                    const isExpanded = expandedFaq === globalIndex;
                    return (
                      <div
                        key={faqIndex}
                        className="border-2 border-gray-100 rounded-lg overflow-hidden hover:border-blue-200 transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100">
                            <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-400 text-sm mt-2">Try different keywords or browse all categories</p>
            </div>
          )}
        </div>

        {/* Still Need Help Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Our admin support team is here to assist you with any questions or technical issues.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
              Contact Support Team
            </button>
            <button className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white/20">
              Schedule Training Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;
