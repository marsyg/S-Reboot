
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Posts from "./pages/Posts";

const queryClient = new QueryClient();

// Auth guard component with editor password check
const AuthRoute = ({ element }: { element: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerifiedEditor, setHasVerifiedEditor] = useState(false);
  
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authenticated = !!session;
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkSession();
    
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    // Check if we need to verify editor password
    if (isAuthenticated && !hasVerifiedEditor) {
      const verifyEditorPassword = () => {
        const editorPassword = prompt("Enter editor password to access the journal editor:");
        if (editorPassword === "EDITOR") {
          setHasVerifiedEditor(true);
        } else {
          toast("Access Denied", {
            description: "Incorrect editor password. Redirecting to posts.",
          });
          window.location.href = "/posts";
        }
      };
      
      verifyEditorPassword();
    }
  }, [isAuthenticated, hasVerifiedEditor]);
  
  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (isAuthenticated && !hasVerifiedEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Verifying editor access...</div>
      </div>
    );
  }
  
  return element;
};

// Regular auth route without editor verification
const UserAuthRoute = ({ element }: { element: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return element;
};

// Public route guard (redirects to app if logged in)
const PublicRoute = ({ element }: { element: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkSession();
  }, []);
  
  if (isLoading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/posts" />;
  }
  
  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/app" element={<AuthRoute element={<Index />} />} />
          <Route path="/posts" element={<UserAuthRoute element={<Posts />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
