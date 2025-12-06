import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Home } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Last Updated: December 2025</p>

          <div className="prose prose-blue max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Snap & Report portal, you agree to be bound by these Terms of Service. 
                If you do not agree with any part of these terms, you must not use this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                Snap & Report is a civic engagement platform that enables citizens to report municipal issues, 
                track complaint status, and communicate with municipal authorities. The service is provided by 
                the Mumbai Municipal Corporation for the benefit of residents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-3">As a user, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and truthful information in all complaints</li>
                <li>Use the platform only for legitimate municipal issue reporting</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not impersonate others or create false identities</li>
                <li>Not upload malicious content, spam, or inappropriate material</li>
                <li>Respect the privacy and rights of other users</li>
                <li>Not abuse, harass, or threaten municipal officers or staff</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Complaint Guidelines</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                All complaints must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Be related to municipal services and civic issues</li>
                <li>Include accurate location information</li>
                <li>Contain clear descriptions and relevant photos</li>
                <li>Be submitted in good faith</li>
                <li>Not contain defamatory, offensive, or illegal content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                The municipality reserves the right to reject or remove complaints that violate these guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Account Security</h2>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the security of your account. Notify us immediately if you 
                suspect unauthorized access. We are not liable for losses resulting from unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive for continuous availability, we do not guarantee uninterrupted access to the platform. 
                Maintenance, updates, or technical issues may cause temporary service interruptions. We are not liable 
                for any damages resulting from service unavailability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Response Times</h2>
              <p className="text-gray-700 leading-relaxed">
                Response times for complaints vary based on issue severity, department workload, and resource availability. 
                While we aim to address all issues promptly, specific response time guarantees are not provided unless 
                explicitly stated in SLA commitments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Content Ownership</h2>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content you submit (photos, descriptions, etc.). By submitting content, you grant 
                the municipality a non-exclusive, royalty-free license to use, display, and process your content for 
                complaint resolution and service improvement purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Users must not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Attempt to hack, compromise, or disrupt platform security</li>
                <li>Use automated systems (bots) to spam complaints</li>
                <li>Reverse engineer or extract source code</li>
                <li>Submit false or misleading information</li>
                <li>Use the platform for commercial or advertising purposes</li>
                <li>Violate applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, 
                or misuse the platform. Terminated users may be prohibited from creating new accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                The municipality and its officers are not liable for indirect, incidental, or consequential damages 
                arising from platform use. Our liability is limited to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Disputes arising from platform use shall be resolved through appropriate legal channels within the 
                jurisdiction of Mumbai, Maharashtra, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these terms at any time. Material changes will be communicated via email or platform 
                notification. Continued use after changes constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of India. Any legal proceedings must be conducted in courts 
                located in Mumbai, Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions regarding these terms:
              </p>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Support Team</strong><br />
                  Mumbai Municipal Corporation<br />
                  Email: support@mumbai.gov.in<br />
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
              to="/privacy" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Privacy Policy
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

export default Terms;
