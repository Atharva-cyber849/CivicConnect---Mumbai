import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Last Updated: December 2025</p>

          <div className="prose prose-blue max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information Collection</h2>
              <p className="text-gray-700 leading-relaxed">
                The Snap & Report portal collects information necessary to process citizen complaints and provide municipal services. 
                This includes personal details provided during registration, complaint submissions, and usage analytics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types of Information Collected</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and residential address</li>
                <li><strong>Complaint Data:</strong> Issue descriptions, photos, location coordinates, and timestamps</li>
                <li><strong>Usage Data:</strong> Login times, feature usage, and device information</li>
                <li><strong>Location Data:</strong> GPS coordinates for geo-tagging complaints</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Information collected is used for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Processing and resolving citizen complaints</li>
                <li>Communicating complaint status updates</li>
                <li>Improving municipal services and response times</li>
                <li>Analyzing service trends and performance metrics</li>
                <li>Ensuring accountability and transparency</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your personal information from unauthorized access, 
                disclosure, alteration, or destruction. All data transmissions are encrypted using SSL/TLS protocols.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be shared with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Municipal officers assigned to your complaint</li>
                <li>Relevant government departments for resolution</li>
                <li>Third-party service providers under strict confidentiality agreements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We do not sell or rent your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account (subject to legal requirements)</li>
                <li>Opt-out of non-essential communications</li>
                <li>File a complaint with relevant data protection authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance user experience, maintain sessions, 
                and analyze platform usage. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                This service is not intended for individuals under 18 years of age. We do not knowingly collect 
                personal information from minors without parental consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy periodically. Material changes will be communicated via email 
                or prominent notice on the portal. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For privacy-related inquiries or to exercise your rights, contact:
              </p>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer</strong><br />
                  Mumbai Municipal Corporation<br />
                  Email: privacy@mumbai.gov.in<br />
                  Phone: 1800-XXX-XXXX
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Link 
              to="/terms" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Terms of Service
            </Link>
            <Link 
              to="/sitemap" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
