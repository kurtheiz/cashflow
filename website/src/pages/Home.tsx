import { CalendarIcon, DollarSignIcon, BriefcaseIcon } from 'lucide-react';
import CasualPayLogo from '../components/CasualPayLogo';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-20 px-4 rounded-2xl overflow-hidden mb-16">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center mb-6">
              <CasualPayLogo size="large" variant="light" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Simplify Your Casual Work Payments</h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto text-center mb-8">
              Track shifts, calculate pay rates, and manage your casual income with ease
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!isLoggedIn ? (
                <div className="bg-white rounded-lg shadow-md p-2">
                  <GoogleLoginButton />
                </div>
              ) : (
                <a href="/overview" className="bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-6 rounded-lg text-center transition-all">
                  Go to Dashboard
                </a>
              )}
              <a href="#features" className="bg-indigo-700 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg text-center transition-all">
                Learn More
              </a>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full opacity-20 transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 transform -translate-x-10 translate-y-10"></div>
        </div>
        
        {/* Features section */}
        <div id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Casual Pay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BriefcaseIcon className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Shift Tracking</h3>
              <p className="text-gray-600">
                Easily log your shifts, break times, and work hours across multiple employers.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <DollarSignIcon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accurate Pay Calculation</h3>
              <p className="text-gray-600">
                Automatically calculate your pay with correct casual rates, including penalties and loadings.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-purple-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CalendarIcon className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Timeline</h3>
              <p className="text-gray-600">
                See your work schedule and payments in a clear, visual timeline that makes planning easy.
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
                <div className="bg-indigo-100 rounded-full p-3 text-indigo-600 font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enter your employer details</h3>
                  <p className="text-gray-600">Add information about your casual employers, including award rates and pay cycles.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 rounded-full p-3 text-indigo-600 font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Log your shifts</h3>
                  <p className="text-gray-600">Record your work hours, breaks, and any special conditions like public holidays.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 rounded-full p-3 text-indigo-600 font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">View your earnings</h3>
                  <p className="text-gray-600">See detailed breakdowns of your pay, including tax estimates and superannuation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Ready to take control of your casual income?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of casual workers who are simplifying their pay management with Casual Pay.
          </p>
          {!isLoggedIn ? (
            <div className="bg-white inline-block rounded-lg shadow-md p-2">
              <GoogleLoginButton />
            </div>
          ) : (
            <a href="/overview" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg inline-block transition-all">
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
