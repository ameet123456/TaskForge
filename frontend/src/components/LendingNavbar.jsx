import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[#191818]/95 backdrop-blur-sm border-b border-[#333333] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Matching your landing page */}
            <div className="flex items-center">
              <div 
                className="cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent hover:from-[#FF1E00] hover:via-white hover:to-gray-300 transition-all duration-500 transform hover:scale-105">
                  TaskForge
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-300 hover:text-[#FF1E00] px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF1E00] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection('why')}
                  className="text-gray-300 hover:text-[#FF1E00] px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  Why TaskForge
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF1E00] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-gray-300 hover:text-[#FF1E00] px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF1E00] transition-all duration-300 group-hover:w-full"></span>
                </button>
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-[#333333] rounded-lg hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login?demo=true')}
                className="bg-[#FF1E00] hover:bg-[#e51a00] text-white px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#FF1E00]/50 transform hover:-rotate-1 flex items-center space-x-2"
              >
                <span>Try Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-[#FF1E00] hover:bg-[#333333] p-2 rounded-lg transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-6 pt-2 pb-6 space-y-1 bg-[#191818] border-t border-[#333333]">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-[#FF1E00] hover:bg-[#333333] block w-full text-left px-3 py-3 text-base font-medium rounded-lg transition-all duration-300"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('why')}
                className="text-gray-300 hover:text-[#FF1E00] hover:bg-[#333333] block w-full text-left px-3 py-3 text-base font-medium rounded-lg transition-all duration-300"
              >
                Why TaskForge
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-[#FF1E00] hover:bg-[#333333] block w-full text-left px-3 py-3 text-base font-medium rounded-lg transition-all duration-300"
              >
                About
              </button>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-3 border-t border-[#333333]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-gray-300 hover:text-white hover:bg-[#333333] block px-3 py-3 text-base font-medium rounded-lg transition-all duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login?demo=true');
                  }}
                  className="w-full bg-[#FF1E00] hover:bg-[#e51a00] text-white px-3 py-3 text-base font-bold rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Try Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Global Styles for smooth scrolling */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};

export default LandingNavbar;