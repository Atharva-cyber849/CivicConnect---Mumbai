import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  MapPin, 
  Shield, 
  ClipboardList,
  ChevronRight,
  Search,
  Download,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: Book },
    { id: 'getting-started', label: 'Getting Started', icon: Lightbulb },
    { id: 'complaints', label: 'Complaint Management', icon: ClipboardList },
    { id: 'officers', label: 'Officer Management', icon: Users },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Config', icon: Settings },
  ];

  const documentationSections = [
    {
      category: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      color: 'blue',
      articles: [
        {
          title: 'Admin Dashboard Overview',
          description: 'Learn about the main features and navigation of the admin dashboard',
          link: '#dashboard-overview',
          tags: ['basics', 'navigation']
        },
        {
          title: 'Role-Based Access Control',
          description: 'Understanding different admin roles and their permissions',
          link: '#rbac',
          tags: ['security', 'roles']
        },
        {
          title: 'First Steps as Admin',
          description: 'Quick setup guide for new administrators',
          link: '#first-steps',
          tags: ['setup', 'guide']
        }
      ]
    },
    {
      category: 'complaints',
      title: 'Complaint Management',
      icon: ClipboardList,
      color: 'orange',
      articles: [
        {
          title: 'Viewing Complaints',
          description: 'How to browse, filter, and search complaints',
          link: '#view-complaints',
          tags: ['complaints', 'search']
        },
        {
          title: 'Assigning Complaints',
          description: 'Assign complaints to officers and departments',
          link: '#assign-complaints',
          tags: ['complaints', 'assignment']
        },
        {
          title: 'Updating Complaint Status',
          description: 'Mark complaints as pending, in progress, resolved, or rejected',
          link: '#update-status',
          tags: ['complaints', 'status']
        },
        {
          title: 'Priority Management',
          description: 'Set and manage complaint priorities',
          link: '#priorities',
          tags: ['complaints', 'priority']
        },
        {
          title: 'Complaint Notes',
          description: 'Add internal notes and communication to complaints',
          link: '#notes',
          tags: ['complaints', 'communication']
        }
      ]
    },
    {
      category: 'officers',
      title: 'Officer Management',
      icon: Users,
      color: 'purple',
      articles: [
        {
          title: 'Adding New Officers',
          description: 'Create and configure new officer accounts',
          link: '#add-officers',
          tags: ['officers', 'creation']
        },
        {
          title: 'Managing Officer Assignments',
          description: 'View and manage officer workload and assignments',
          link: '#officer-assignments',
          tags: ['officers', 'workload']
        },
        {
          title: 'Officer Performance Tracking',
          description: 'Monitor officer efficiency and resolution rates',
          link: '#performance',
          tags: ['officers', 'metrics']
        },
        {
          title: 'Ward & Zone Assignment',
          description: 'Assign officers to specific wards and zones',
          link: '#ward-assignment',
          tags: ['officers', 'geography']
        }
      ]
    },
    {
      category: 'analytics',
      title: 'Analytics & Reports',
      icon: BarChart3,
      color: 'green',
      articles: [
        {
          title: 'Dashboard Analytics',
          description: 'Understanding key metrics and statistics',
          link: '#analytics-overview',
          tags: ['analytics', 'metrics']
        },
        {
          title: 'SLA Dashboard',
          description: 'Service Level Agreement tracking and monitoring',
          link: '#sla-tracking',
          tags: ['sla', 'performance']
        },
        {
          title: 'Ward Statistics',
          description: 'View ward-wise complaint and resolution data',
          link: '#ward-stats',
          tags: ['wards', 'statistics']
        },
        {
          title: 'Generating Reports',
          description: 'Create and export custom reports',
          link: '#reports',
          tags: ['reports', 'export']
        },
        {
          title: 'Map Visualization',
          description: 'Use map view to visualize complaints geographically',
          link: '#map-view',
          tags: ['map', 'visualization']
        }
      ]
    },
    {
      category: 'settings',
      title: 'Settings & Configuration',
      icon: Settings,
      color: 'gray',
      articles: [
        {
          title: 'Department Management',
          description: 'Add, edit, and configure departments',
          link: '#departments',
          tags: ['departments', 'configuration']
        },
        {
          title: 'System Settings',
          description: 'Configure system-wide preferences',
          link: '#system-settings',
          tags: ['settings', 'configuration']
        },
        {
          title: 'User Profile Management',
          description: 'Update your admin profile and preferences',
          link: '#profile',
          tags: ['profile', 'account']
        },
        {
          title: 'Security Settings',
          description: 'Password policies and security configuration',
          link: '#security',
          tags: ['security', 'authentication']
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'API Documentation', icon: FileText, href: '#api-docs', external: true },
    { title: 'User Guide PDF', icon: Download, href: '#user-guide', external: true },
    { title: 'Video Tutorials', icon: ExternalLink, href: '#videos', external: true },
    { title: 'FAQ', icon: Info, href: '#faq', external: false },
  ];

  const filteredSections = documentationSections.filter(section => 
    selectedCategory === 'all' || section.category === selectedCategory
  ).filter(section => 
    !searchQuery || 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      gray: 'bg-gray-50 border-gray-200 text-gray-900',
    };
    return colors[color] || colors.gray;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-l-4 border-blue-600 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
              <p className="text-gray-600">Admin Portal User Guide & Reference</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm">{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
                <div className="space-y-2">
                  {quickLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.title}</span>
                      {link.external && <ExternalLink className="w-3 h-3 ml-auto" />}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search or browse by category</p>
              </div>
            ) : (
              filteredSections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Section Header */}
                  <div className={`border-l-4 ${getColorClasses(section.color)} border p-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getIconColorClasses(section.color)} rounded-lg flex items-center justify-center`}>
                        <section.icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold">{section.title}</h2>
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {section.articles.map((article, articleIdx) => (
                        <a
                          key={articleIdx}
                          href={article.link}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag, tagIdx) => (
                                  <span
                                    key={tagIdx}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Need Additional Help?</h3>
                  <p className="text-blue-700 mb-4">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Contact Support
                    </button>
                    <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
