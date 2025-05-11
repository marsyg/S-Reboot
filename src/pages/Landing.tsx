import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="bg-gray-900 text-white p-4 md:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Flowy Scribe</h1>
          <div className="space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/app")}>
                  Go to App
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    localStorage.removeItem("user");
                    setIsAuthenticated(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section inspired by Strata */}
      <section className="grid md:grid-cols-5 flex-1">
        {/* Left sidebar with profile - similar to Strata */}
        <div className="bg-gray-800 text-white p-6 md:col-span-2 flex flex-col items-center justify-center relative">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop')" }}
          ></div>
          <div className="relative z-10 text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-white">
              <img 
                src="/placeholder.svg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">Flowy Scribe</h1>
            <p className="text-gray-300 mb-6">
              A nested bullet journal with rich text and media support
            </p>
            <div className="flex justify-center space-x-4 text-gray-300 text-2xl mt-6">
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">Email</span>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-12 md:col-span-3 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">Your thoughts, organized beautifully</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Flowy Scribe helps you organize your thoughts with a nested bullet journal system. 
            Add images, create collapsible sections, and access your journals from anywhere.
          </p>
          <ul className="space-y-6 mb-8">
            <li className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Nested Bullet Points</h3>
                <p className="text-gray-600">Organize your thoughts hierarchically with unlimited nesting levels.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Rich Media Support</h3>
                <p className="text-gray-600">Add and resize images directly in your journal entries.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 mt-1">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Collapsible Sections</h3>
                <p className="text-gray-600">Keep your journal clean by collapsing sections you don't need.</p>
              </div>
            </li>
          </ul>
          <div className="mt-auto">
            <Button 
              onClick={() => isAuthenticated ? navigate("/app") : navigate("/login")} 
              size="lg" 
              className="mr-4"
            >
              {isAuthenticated ? "Go to Your Journals" : "Get Started"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t p-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Flowy Scribe. All rights reserved. Inspired by HTML5 UP.</p>
      </footer>
    </div>
  );
};

export default Landing;
