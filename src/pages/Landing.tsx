
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 md:p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Flowy Scribe</h1>
          <div className="space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/app")} className="border-white text-white hover:bg-white hover:text-gray-900">
                  Go to App
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                  className="text-white hover:bg-white/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} className="text-white hover:bg-white/10">
                  Login
                </Button>
                <Button variant="outline" onClick={() => navigate("/login?signup=true")} className="border-white text-white hover:bg-white hover:text-gray-900">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="grid md:grid-cols-5 flex-1">
        {/* Left sidebar with profile */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-700 text-white p-6 md:col-span-2 flex flex-col items-center justify-center relative">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop')" }}
          ></div>
          <div className="relative z-10 text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-white/10 backdrop-blur-md ring-4 ring-white/30 shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">Flowy Scribe</h1>
            <p className="text-gray-200 mb-6 text-lg max-w-md mx-auto">
              A nested bullet journal with rich text, media support, and beautiful sharing options
            </p>
            <div className="flex justify-center space-x-4 text-white text-xl mt-8">
              <a href="#" className="hover:text-blue-300 transition-colors p-2 hover:scale-110">
                <span className="sr-only">Twitter</span>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors p-2 hover:scale-110">
                <span className="sr-only">GitHub</span>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                </svg>
              </a>
              <a href="#" className="hover:text-red-300 transition-colors p-2 hover:scale-110">
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
        <div className="p-6 md:p-12 md:col-span-3 flex flex-col justify-center bg-gray-50">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">Your thoughts, organized <span className="text-blue-600">beautifully</span></h2>
          <p className="text-gray-600 mb-8 text-lg">
            Flowy Scribe helps you organize your thoughts with a nested bullet journal system. 
            Add images, create collapsible sections, and share your journals with the community.
          </p>
          <ul className="space-y-6 mb-10">
            <li className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-green-500 mr-3 mt-1 text-xl">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Nested Bullet Points</h3>
                <p className="text-gray-600">Organize your thoughts hierarchically with unlimited nesting levels.</p>
              </div>
            </li>
            <li className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-green-500 mr-3 mt-1 text-xl">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Rich Media Support</h3>
                <p className="text-gray-600">Add and resize images directly in your journal entries with flexible positioning.</p>
              </div>
            </li>
            <li className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-green-500 mr-3 mt-1 text-xl">✓</span>
              <div>
                <h3 className="font-semibold text-xl mb-1">Community Sharing</h3>
                <p className="text-gray-600">Share your journals and engage with other users through comments.</p>
              </div>
            </li>
          </ul>
          <div className="mt-auto">
            <Button 
              onClick={() => isAuthenticated ? navigate("/app") : navigate("/login")} 
              size="lg" 
              className="mr-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md"
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
        <p>© {new Date().getFullYear()} Flowy Scribe. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
