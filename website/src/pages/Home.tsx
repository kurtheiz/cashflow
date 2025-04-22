import { CalendarIcon, DollarSignIcon, BriefcaseIcon } from 'lucide-react';
// Logo import removed
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const featuresRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="container mx-auto max-w-screen-md px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-[var(--primary-blue)] to-[var(--system-blue)] text-white py-20 px-4 rounded-2xl overflow-hidden mb-16">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center mb-6">
              <h2 className="text-3xl font-bold">CasualPay</h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Simplify Your Casual Work Payments</h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto text-center mb-8">
              Track shifts, calculate pay rates, and organise your casual income with ease
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!isLoggedIn ? (
                <div className="bg-white rounded-lg shadow-md p-2">
                  <GoogleLoginButton />
                </div>
              ) : (
                <a href="#/overview" className="bg-[var(--primary-blue)] hover:opacity-90 text-white font-medium py-3 px-6 rounded-lg text-center transition-all">
                  Go to Dashboard
                </a>
              )}
              <button 
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[var(--system-blue)] hover:opacity-90 text-white font-medium py-3 px-6 rounded-lg text-center transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-blue)] rounded-full opacity-20 transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--primary-blue)] rounded-full opacity-20 transform -translate-x-10 translate-y-10"></div>
        </div>
        
        {/* Features section */}
        <div ref={featuresRef} className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Casual Pay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BriefcaseIcon className="h-7 w-7 text-[var(--primary-blue)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Shift Tracking</h3>
              <p className="text-gray-600">
                Easily log your shifts and track your work hours across multiple employers with a simple interface.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <DollarSignIcon className="h-7 w-7 text-[var(--primary-blue)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accurate Pay Calculation</h3>
              <p className="text-gray-600">
                Automatically calculate your pay with correct casual rates, including penalties and loadings based on award rates.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CalendarIcon className="h-7 w-7 text-[var(--primary-blue)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Views</h3>
              <p className="text-gray-600">
                View your shifts and pay schedule as a list or calendar, making it easy to track your work at a glance.
              </p>
            </div>

            {/* Feature 4 - AI Screenshot Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md">Coming Soon</div>
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[var(--primary-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Uploads</h3>
              <p className="text-gray-600">
                Upload screenshots of your work rosters and our AI will automatically extract and add your shifts to the app.
              </p>
            </div>

            {/* Feature 5 - Tax Estimates */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[var(--primary-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M12 11h4"/>
                  <path d="M12 16h4"/>
                  <path d="M8 11h.01"/>
                  <path d="M8 16h.01"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Estimates</h3>
              <p className="text-gray-600">
                Get accurate tax estimates for your casual income, helping you organise your finances and avoid surprises at tax time.
              </p>
            </div>

            {/* Feature 6 - Multiple Employers */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[var(--primary-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Multiple Employers</h3>
              <p className="text-gray-600">
                Manage shifts and payments from multiple casual employers in one place with a simple, organised interface.
              </p>
            </div>
          </div>
        </div>
        
        {/* How it works section */}
        <div className="bg-gray-50 py-16 px-4 rounded-xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 text-[var(--system-blue)] font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enter your employer details</h3>
                  <p className="text-gray-600">Add information about your casual employers, including award rates and pay cycles for accurate calculations.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 text-[var(--system-blue)] font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Log your shifts</h3>
                  <p className="text-gray-600">Enter shift details manually or use our upcoming AI feature to upload screenshots of your work roster for automatic entry.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 text-[var(--system-blue)] font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">View your earnings</h3>
                  <p className="text-gray-600">See detailed breakdowns of your pay, including tax estimates, superannuation, and different payment categories.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 text-[var(--system-blue)] font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Track your schedule</h3>
                  <p className="text-gray-600">Use the calendar view to see your upcoming shifts and payment dates in a visual format that makes organisation easy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-20 -translate-y-20"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Coming Soon: AI-Powered Shift Import</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <p className="text-blue-100 mb-6">
                  We're excited to announce our upcoming AI feature that will revolutionise how you track shifts. Simply upload a screenshot of your work roster, and our advanced AI will automatically extract and add all your shifts to the app.
                </p>
                <ul className="list-disc list-inside space-y-2 text-blue-100 mb-6">
                  <li>Save time with automatic shift entry</li>
                  <li>Eliminate manual data entry errors</li>
                  <li>Works with most common scheduling formats</li>
                  <li>Instant processing with high accuracy</li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="border-2 border-dashed border-white/40 rounded-lg p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm font-medium">Upload roster screenshot</p>
                  <p className="text-xs mt-2 text-blue-200">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Ready to take control of your casual income?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of casual workers who are simplifying their pay management with CasualPay.
          </p>
          {!isLoggedIn ? (
            <div className="bg-white inline-block rounded-lg shadow-md p-2">
              <GoogleLoginButton />
            </div>
          ) : (
            <a href="#/overview" className="bg-[var(--primary-blue)] hover:opacity-90 text-white font-medium py-3 px-6 rounded-lg inline-block transition-all">
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
