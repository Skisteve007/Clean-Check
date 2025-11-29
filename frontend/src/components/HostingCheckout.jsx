import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const HostingCheckout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Digital Document Hosting
          </h1>
          <p className="text-xl text-gray-600">
            Monthly Cloud Storage & QR Generation Services
          </p>
        </div>

        {/* Features Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-2xl">Service Features</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Cloud Storage</h3>
                  <p className="text-sm text-gray-600">Store your documents safely in encrypted cloud infrastructure</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">QR Code Generation</h3>
                  <p className="text-sm text-gray-600">Create custom QR codes for easy sharing and access</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Monthly Subscription</h3>
                  <p className="text-sm text-gray-600">Cancel anytime, no long-term commitment required</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Access</h3>
                  <p className="text-sm text-gray-600">Start using your storage space immediately after payment</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-Device Access</h3>
                  <p className="text-sm text-gray-600">Access your documents from any device, anywhere</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">Automatic Updates</h3>
                  <p className="text-sm text-gray-600">Your data is automatically synced and backed up</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Individual Plan - $39 */}
          <Card className="shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-center">
                <div className="text-3xl font-bold mb-2">$1</div>
                <div className="text-sm font-normal">TEST - per year</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Individual Plan (TEST)</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Single user account
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5GB secure storage
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited QR codes
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              
              {/* PayPal Button for TEST - $1 Monthly */}
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                  <input type="hidden" name="cmd" value="_xclick-subscriptions" />
                  <input type="hidden" name="business" value="Steve@bigtexasroof.com" />
                  <input type="hidden" name="item_name" value="TEST - Cloud Hosting Service - Individual Plan" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="no_shipping" value="1" />
                  <input type="hidden" name="a3" value="1.00" />
                  <input type="hidden" name="p3" value="1" />
                  <input type="hidden" name="t3" value="M" />
                  <input type="hidden" name="src" value="1" />
                  <input type="hidden" name="sra" value="1" />
                  <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribeCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!" />
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan - $69 */}
          <Card className="shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                TEST MODE
              </div>
              <CardTitle className="text-center">
                <div className="text-3xl font-bold mb-2">$1</div>
                <div className="text-sm font-normal">TEST - per year</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Premium Plan (TEST)</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Two user accounts
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  15GB secure storage
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited QR codes
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  24/7 premium support
                </li>
              </ul>
              
              {/* PayPal Button for TEST - $1 Monthly */}
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                  <input type="hidden" name="cmd" value="_xclick-subscriptions" />
                  <input type="hidden" name="business" value="Steve@bigtexasroof.com" />
                  <input type="hidden" name="item_name" value="TEST - Cloud Hosting Service - Premium Plan" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="no_shipping" value="1" />
                  <input type="hidden" name="a3" value="1.00" />
                  <input type="hidden" name="p3" value="1" />
                  <input type="hidden" name="t3" value="M" />
                  <input type="hidden" name="src" value="1" />
                  <input type="hidden" name="sra" value="1" />
                  <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribeCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!" />
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Guarantee Section */}
        <Card className="shadow-lg mb-8 bg-green-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <svg className="w-12 h-12 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment Guarantee</h3>
                <p className="text-gray-700 mb-2">
                  Your payment is processed securely through PayPal. We never see or store your credit card information.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliant</li>
                  <li>• Cancel subscription anytime</li>
                  <li>• 30-day money-back satisfaction guarantee</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">When does my subscription start?</h4>
                <p className="text-sm text-gray-600">Your subscription begins immediately after payment confirmation. You'll receive instant access to your storage and services.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">Yes! You can cancel your subscription at any time through your PayPal account. Your service will remain active until the end of your current billing period.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">What payment methods do you accept?</h4>
                <p className="text-sm text-gray-600">We accept all major credit cards, debit cards, and PayPal accounts through our secure PayPal payment processor.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Is my data secure?</h4>
                <p className="text-sm text-gray-600">Absolutely. We use industry-standard encryption and security measures to protect your documents. Your data is stored on secure cloud servers with regular backups.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 Digital Document Hosting Services. All rights reserved.</p>
          <p className="mt-2">Secure payment processing powered by PayPal</p>
        </div>
      </div>
    </div>
  );
};

export default HostingCheckout;
