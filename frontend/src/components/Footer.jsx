import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

const Footer = () => {
  const [openPolicy, setOpenPolicy] = useState(null);

  const policies = {
    terms: {
      title: 'Terms of Service',
      content: (
        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500">Last Updated: November 28, 2025</p>
          
          <h3 className="font-bold text-lg text-gray-900">1. Acceptance of Terms</h3>
          <p>
            By accessing and using Clean Check, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our platform.
          </p>

          <h3 className="font-bold text-lg text-gray-900">2. Service Description</h3>
          <p>
            Clean Check is a document storage and sharing platform designed for health verification purposes. 
            We provide a secure platform for storing health-related documents and generating QR codes for sharing.
          </p>
          <p className="font-semibold text-red-700">
            IMPORTANT: Clean Check is a document storage tool ONLY. We do not medically verify, validate, 
            or authenticate any health documents or test results. Users are solely responsible for the 
            accuracy of uploaded information.
          </p>

          <h3 className="font-bold text-lg text-gray-900">3. Membership & Subscriptions</h3>
          <p>
            Clean Check operates on a subscription-based membership model. By subscribing, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pay recurring monthly fees as selected ($39/month Single or $69/month Joint)</li>
            <li>Automatic renewal on a 30-day cycle until cancelled</li>
            <li>Maintain accurate and current health documentation</li>
            <li>Update documents as they expire or become outdated</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">4. Age Requirement</h3>
          <p className="font-semibold">
            You must be at least 18 years of age to use Clean Check. By using this platform, 
            you certify that you are 18 years of age or older.
          </p>

          <h3 className="font-bold text-lg text-gray-900">5. Prohibited Content & Conduct</h3>
          <p className="font-bold text-red-700">
            The following content and conduct are STRICTLY PROHIBITED:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-red-700 font-semibold">
            <li>Illegal content of any kind</li>
            <li>Content depicting or involving minors</li>
            <li>Fraudulent or falsified health documents</li>
            <li>Harassment, threats, or abusive behavior</li>
            <li>Impersonation of others</li>
            <li>Spam or commercial solicitation</li>
            <li>Malware, viruses, or malicious code</li>
            <li>Violation of any local, state, or federal laws</li>
          </ul>
          <p className="text-red-700">
            Violation of these prohibitions will result in immediate account termination 
            without refund and may be reported to law enforcement.
          </p>

          <h3 className="font-bold text-lg text-gray-900">6. User Responsibilities</h3>
          <p>Users are responsible for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintaining the confidentiality of their account</li>
            <li>Ensuring accuracy of uploaded health documents</li>
            <li>Updating expired documents (60+ days old)</li>
            <li>Complying with all applicable laws</li>
            <li>Any activities that occur under their account</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">7. Disclaimer of Warranties</h3>
          <p className="font-semibold">
            CLEAN CHECK IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not warrant 
            the accuracy, completeness, or reliability of any health information stored on our platform.
          </p>

          <h3 className="font-bold text-lg text-gray-900">8. Limitation of Liability</h3>
          <p>
            Clean Check, its owners, and operators shall not be liable for any direct, indirect, 
            incidental, consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use or inability to use the service</li>
            <li>Reliance on any information stored on the platform</li>
            <li>Interactions between users</li>
            <li>Unauthorized access to user data</li>
            <li>Any third-party claims related to stored documents</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">9. Indemnification</h3>
          <p>
            You agree to indemnify, defend, and hold harmless Clean Check from any claims, 
            damages, losses, liabilities, and expenses arising from your use of the service 
            or violation of these terms.
          </p>

          <h3 className="font-bold text-lg text-gray-900">10. Termination</h3>
          <p>
            We reserve the right to terminate or suspend accounts at any time for violation 
            of these terms or for any reason at our sole discretion.
          </p>

          <h3 className="font-bold text-lg text-gray-900">11. Changes to Terms</h3>
          <p>
            We may modify these terms at any time. Continued use of the platform after 
            changes constitutes acceptance of new terms.
          </p>

          <h3 className="font-bold text-lg text-gray-900">12. Governing Law</h3>
          <p>
            These terms shall be governed by the laws of the United States. Any disputes 
            shall be resolved in accordance with applicable federal and state laws.
          </p>

          <h3 className="font-bold text-lg text-gray-900">13. Contact</h3>
          <p>
            For questions about these Terms of Service, please contact us through the 
            support channels provided on our platform.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500">Last Updated: November 28, 2025</p>
          
          <h3 className="font-bold text-lg text-gray-900">1. Information We Collect</h3>
          <p>We collect the following information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, membership ID</li>
            <li><strong>Profile Data:</strong> Profile photo, birthday, gender identity, sexual orientation, relationship status</li>
            <li><strong>Health Documents:</strong> Uploaded health verification documents (test results, vaccination records)</li>
            <li><strong>Payment Information:</strong> Processed securely through PayPal (we do not store credit card numbers)</li>
            <li><strong>Usage Data:</strong> Login times, QR code generation, document upload dates</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">2. How We Use Your Information</h3>
          <p>Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain our service</li>
            <li>Process subscription payments</li>
            <li>Generate QR codes for profile sharing</li>
            <li>Track document upload dates and freshness</li>
            <li>Communicate important account updates</li>
            <li>Improve our platform and user experience</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900 text-green-700">3. We NEVER Sell or Share Your Data</h3>
          <p className="font-bold text-lg text-green-700">
            YOUR DATA IS NEVER SOLD OR SHARED WITH THIRD PARTIES.
          </p>
          <p className="font-semibold">
            We explicitly guarantee that:
          </p>
          <ul className="list-disc pl-6 space-y-1 font-semibold">
            <li>Your personal information is NEVER sold to advertisers</li>
            <li>Your health documents are NEVER shared with third parties</li>
            <li>Your profile data is NEVER sold or transferred to data brokers</li>
            <li>We do NOT monetize your data in any way</li>
            <li>Your information stays within Clean Check's secure systems</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">4. Data Sharing - Limited Exceptions</h3>
          <p>We only share data in these specific circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>With Your Consent:</strong> When you share your QR code with partners (voluntary)</li>
            <li><strong>Service Providers:</strong> PayPal for payment processing only</li>
            <li><strong>Legal Compliance:</strong> If required by law, court order, or to protect rights/safety</li>
          </ul>
          <p className="font-semibold text-red-700">
            We will NEVER sell, rent, or trade your data for commercial purposes.
          </p>

          <h3 className="font-bold text-lg text-gray-900">5. Data Security</h3>
          <p>We implement security measures including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure database storage</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
          </ul>
          <p>
            However, no system is 100% secure. You acknowledge the inherent risks of 
            internet-based data storage.
          </p>

          <h3 className="font-bold text-lg text-gray-900">6. Data Retention</h3>
          <p>
            We retain your data for as long as your account is active. Upon account 
            deletion, we will remove your personal data within 30 days, except where 
            retention is required by law.
          </p>

          <h3 className="font-bold text-lg text-gray-900">7. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Update or correct your information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of communications (except essential account notifications)</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">8. Cookies & Tracking</h3>
          <p>
            We use minimal cookies for essential functions (login, session management). 
            We do NOT use tracking cookies for advertising purposes.
          </p>

          <h3 className="font-bold text-lg text-gray-900">9. Children's Privacy</h3>
          <p className="font-semibold">
            Clean Check is not intended for individuals under 18 years of age. We do not 
            knowingly collect data from minors. If we discover a minor has created an 
            account, it will be immediately terminated.
          </p>

          <h3 className="font-bold text-lg text-gray-900">10. Changes to Privacy Policy</h3>
          <p>
            We may update this policy. Material changes will be communicated via email. 
            Continued use after changes constitutes acceptance.
          </p>

          <h3 className="font-bold text-lg text-gray-900">11. Contact</h3>
          <p>
            For privacy concerns or data requests, contact us through our support channels.
          </p>
        </div>
      )
    },
    refund: {
      title: 'Refund Policy',
      content: (
        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500">Last Updated: November 28, 2025</p>
          
          <h3 className="font-bold text-lg text-gray-900">Subscription Refund Policy</h3>
          
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
            <p className="font-bold text-lg text-yellow-900">
              ⚠️ IMPORTANT: Non-Refundable After QR Code Generation
            </p>
            <p className="mt-2 font-semibold">
              Subscriptions are NON-REFUNDABLE after the first QR code generation.
            </p>
          </div>

          <h3 className="font-bold text-lg text-gray-900">1. Refund Eligibility</h3>
          <p><strong>NOT ELIGIBLE for refunds:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Once you have generated your QR code</li>
            <li>Once you have uploaded health documents</li>
            <li>Once you have created your member profile</li>
            <li>After the first payment is processed</li>
            <li>Partial month refunds</li>
            <li>Change of mind after service activation</li>
          </ul>

          <p className="mt-3"><strong>MAY BE ELIGIBLE for refunds:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Technical errors preventing service access (within 24 hours of payment)</li>
            <li>Duplicate charges (within 7 days)</li>
            <li>Unauthorized charges (within 30 days with proof)</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">2. Subscription Cancellation</h3>
          <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg">
            <p className="font-bold text-green-900">
              ✅ You CAN cancel your subscription at any time
            </p>
            <p className="mt-2">
              While subscriptions are non-refundable, you have the right to cancel 
              future billing at any time. Cancellation stops future charges but does 
              not refund current or past billing periods.
            </p>
          </div>

          <h3 className="font-bold text-lg text-gray-900">3. How to Cancel</h3>
          <p>To cancel your subscription:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Log into your PayPal account</li>
            <li>Navigate to Settings → Payments → Manage automatic payments</li>
            <li>Find "Clean Check" subscription</li>
            <li>Click "Cancel" or "Cancel automatic payments"</li>
          </ul>
          <p className="mt-2">
            <strong>Effect of Cancellation:</strong> Your subscription will remain active 
            until the end of your current billing period. You will not be charged again.
          </p>

          <h3 className="font-bold text-lg text-gray-900">4. Billing Cycle</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Subscriptions renew automatically every 30 days</li>
            <li>You are charged on the same day each month</li>
            <li>Cancellation must occur before the next billing date to avoid charges</li>
            <li>No partial month refunds for mid-cycle cancellations</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">5. Service Termination by Clean Check</h3>
          <p>
            If we terminate your account for violation of Terms of Service:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>NO REFUND will be issued</li>
            <li>Access is immediately revoked</li>
            <li>Subscription is automatically cancelled</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">6. Disputed Charges</h3>
          <p>
            If you dispute a charge with your payment provider:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your account will be suspended pending resolution</li>
            <li>Contact us FIRST to resolve issues before filing disputes</li>
            <li>Fraudulent disputes may result in permanent ban</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">7. Requesting a Refund</h3>
          <p>
            If you believe you qualify for a refund (technical error, unauthorized charge):
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Contact support immediately</li>
            <li>Provide your membership ID</li>
            <li>Explain the issue in detail</li>
            <li>Provide relevant screenshots or proof</li>
          </ul>
          <p>
            Refund requests are reviewed on a case-by-case basis. Approval is at our 
            sole discretion.
          </p>

          <h3 className="font-bold text-lg text-gray-900">8. Processing Time</h3>
          <p>
            If a refund is approved:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refunds are processed within 5-7 business days</li>
            <li>Funds returned via original payment method (PayPal)</li>
            <li>Bank processing may take additional 3-5 days</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">9. Subscription Tiers</h3>
          <p>This policy applies to both subscription tiers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Single Member ($39/month):</strong> Non-refundable after QR generation</li>
            <li><strong>Joint/Couple ($69/month):</strong> Non-refundable after QR generation</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">10. Questions</h3>
          <p>
            For questions about refunds or cancellations, contact our support team 
            through the platform.
          </p>

          <div className="bg-gray-100 border-2 border-gray-400 p-4 rounded-lg mt-4">
            <p className="font-bold text-gray-900">Summary:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Subscriptions are NON-REFUNDABLE after QR code generation</li>
              <li>You CAN cancel anytime to stop future charges</li>
              <li>No partial month refunds</li>
              <li>Cancellation takes effect at end of billing period</li>
            </ul>
          </div>
        </div>
      )
    },
    compliance2257: {
      title: '18 U.S.C. § 2257 Compliance',
      content: (
        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500">Last Updated: November 28, 2025</p>
          
          <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg">
            <h3 className="font-bold text-xl text-blue-900">
              Age Verification Statement
            </h3>
            <p className="mt-2 font-bold text-lg">
              All models, members, and users appearing on this site are 18 years of age or older.
            </p>
          </div>

          <h3 className="font-bold text-lg text-gray-900">1. Age Requirements</h3>
          <p className="font-semibold">
            Clean Check strictly enforces age verification requirements. By using this platform:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You certify that you are at least 18 years of age</li>
            <li>You acknowledge that all content is intended for adults only</li>
            <li>You agree that minors are strictly prohibited from using this service</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">2. Compliance with Federal Law</h3>
          <p>
            Clean Check complies with 18 U.S.C. § 2257 and 28 C.F.R. 75 record-keeping 
            requirements for platforms hosting user-generated content. We maintain records 
            documenting the age of all members.
          </p>

          <h3 className="font-bold text-lg text-gray-900">3. Content Restrictions</h3>
          <p className="font-semibold text-red-700">
            STRICTLY PROHIBITED:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-red-700 font-semibold">
            <li>Any content depicting or involving minors (under 18 years)</li>
            <li>Content suggesting or implying underage individuals</li>
            <li>Age play or similar content</li>
            <li>Links to sites featuring underage content</li>
          </ul>
          <p className="text-red-700 font-bold mt-2">
            Violations will result in immediate account termination and reporting to 
            law enforcement authorities.
          </p>

          <h3 className="font-bold text-lg text-gray-900">4. Age Verification Process</h3>
          <p>Clean Check employs multiple age verification measures:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Age gate on homepage (18+ confirmation required)</li>
            <li>Birthday verification during profile creation</li>
            <li>Terms of Service acceptance (age certification)</li>
            <li>Ongoing monitoring for compliance</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">5. Record Keeping</h3>
          <p>
            As required by federal law, we maintain records of:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Member registration dates</li>
            <li>Age verification confirmations</li>
            <li>Profile creation timestamps</li>
            <li>Account activity logs</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">6. Reporting Violations</h3>
          <p>
            If you encounter any content or accounts that may violate age requirements:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Report immediately through our support channels</li>
            <li>Do not engage with or share the content</li>
            <li>Provide as much detail as possible (membership ID, timestamps, etc.)</li>
          </ul>
          <p className="font-semibold mt-2">
            We take all reports seriously and investigate promptly.
          </p>

          <h3 className="font-bold text-lg text-gray-900">7. Custodian of Records</h3>
          <p>
            Records required under 18 U.S.C. § 2257 are maintained by:
          </p>
          <p className="font-mono bg-gray-100 p-3 rounded">
            Clean Check Records Custodian<br />
            [Address to be provided upon platform deployment]<br />
            Available for inspection during regular business hours
          </p>

          <h3 className="font-bold text-lg text-gray-900">8. Platform Responsibility</h3>
          <p>
            Clean Check is committed to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintaining a safe, adults-only environment</li>
            <li>Strict enforcement of age requirements</li>
            <li>Cooperation with law enforcement</li>
            <li>Continuous monitoring and compliance</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">9. User Responsibility</h3>
          <p className="font-semibold">
            Users are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Truthful age disclosure</li>
            <li>Reporting violations</li>
            <li>Not sharing accounts with minors</li>
            <li>Ensuring all uploaded content complies with age requirements</li>
          </ul>

          <h3 className="font-bold text-lg text-gray-900">10. Legal Consequences</h3>
          <p className="text-red-700 font-semibold">
            Violations of age requirements may result in:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-red-700">
            <li>Immediate account termination</li>
            <li>Permanent ban from platform</li>
            <li>Reporting to National Center for Missing & Exploited Children (NCMEC)</li>
            <li>Reporting to local, state, and federal law enforcement</li>
            <li>Criminal prosecution</li>
          </ul>

          <div className="bg-red-50 border-2 border-red-600 p-4 rounded-lg mt-4">
            <p className="font-bold text-red-900 text-lg">
              ⚠️ ZERO TOLERANCE POLICY
            </p>
            <p className="mt-2 font-semibold text-red-800">
              Clean Check maintains a ZERO TOLERANCE policy for any content involving 
              minors. We cooperate fully with law enforcement and will prosecute 
              violations to the fullest extent of the law.
            </p>
          </div>

          <h3 className="font-bold text-lg text-gray-900">11. Contact</h3>
          <p>
            For questions about age compliance or to report violations, contact our 
            compliance team immediately through official support channels.
          </p>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white py-8 mt-12 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-2">✅ Clean Check</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Elevating Intimacy through Verified Transparency and Mutual Trust
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">
                © 2025 Clean Check. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-300 mb-3 text-base md:text-lg">Legal & Compliance</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setOpenPolicy('terms')}
                  className="block w-full md:w-auto text-left text-gray-400 hover:text-white text-sm md:text-base transition-colors py-1"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setOpenPolicy('privacy')}
                  className="block w-full md:w-auto text-left text-gray-400 hover:text-white text-sm md:text-base transition-colors py-1"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setOpenPolicy('refund')}
                  className="block w-full md:w-auto text-left text-gray-400 hover:text-white text-sm md:text-base transition-colors py-1"
                >
                  Refund Policy
                </button>
                <button
                  onClick={() => setOpenPolicy('compliance2257')}
                  className="block w-full md:w-auto text-left text-gray-400 hover:text-white text-sm md:text-base transition-colors py-1"
                >
                  18 U.S.C. § 2257 Compliance
                </button>
              </div>
            </div>
          </div>

          {/* Age Disclaimer */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm md:text-base font-semibold px-4">
              🔞 All models/users appearing on this site are 18 years of age or older.
            </p>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {openPolicy && (
        <Dialog open={!!openPolicy} onOpenChange={() => setOpenPolicy(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {policies[openPolicy].title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {policies[openPolicy].content}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setOpenPolicy(null)} variant="destructive">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Footer;
