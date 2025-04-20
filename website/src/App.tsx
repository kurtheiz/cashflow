import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TimelinePage from './pages/Timeline';
import Shifts from './pages/Shifts';
import { useState } from 'react';
import { HomeIcon, CalendarIcon, MenuIcon, XIcon } from 'lucide-react';
import CasualPayLogo from './components/CasualPayLogo';
import BottomToolbar from './components/BottomToolbar';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <CasualPayLogo size="medium" variant="default" />
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
            
            {/* Desktop menu */}
            <div className="hidden md:flex space-x-4">
              <a href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                <HomeIcon className="h-4 w-4 mr-1" /> Home
              </a>
              <a href="/timeline" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
                <CalendarIcon className="h-4 w-4 mr-1" /> Timeline
              </a>
            </div>
          </div>
          
          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2">
              <a href="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                <HomeIcon className="h-4 w-4 mr-1" /> Home
              </a>
              <a href="/timeline" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
                <CalendarIcon className="h-4 w-4 mr-1" /> Timeline
              </a>
            </div>
          )}
        </nav>
        
        {/* Main content */}
        <main className="py-4 pb-20">  {/* Added bottom padding to account for the toolbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/employers" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Employers</h1><p className="mt-4">This page is under construction.</p></div>} />
            <Route path="/calendar" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Calendar</h1><p className="mt-4">This page is under construction.</p></div>} />
            <Route path="/settings" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Settings</h1><p className="mt-4">This page is under construction.</p></div>} />
          </Routes>
        </main>
        
        {/* Bottom Toolbar */}
        <BottomToolbar />
      </div>
    </Router>
  );
}

export default App;
