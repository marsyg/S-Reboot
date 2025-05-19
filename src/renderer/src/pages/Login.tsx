import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { toast } from '../components/ui/sonner';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import {
  signInWithEmail,
  signUpWithEmail,
} from '../integrations/supabase/auth';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we should show signup form initially
  const [mode, setMode] = useState<'login' | 'signup'>(
    location.search.includes('signup=true') ? 'signup' : 'login'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        // Handle login
        const data = await signInWithEmail(email, password);
        toast.success('Successfully logged in!');
        navigate('/app');
      } else {
        // Handle signup
        const data = await signUpWithEmail(email, password, name);

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          toast.success('Please check your email for the confirmation link');
        } else {
          // If email confirmation not required, user is created
          toast.success('Account created successfully!');
          navigate('/app');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(
        error.error_description || error.message || 'Authentication failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden'>
      {/* Subtle background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50'></div>
      </div>

      <header className='bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4 shadow-sm relative z-10'>
        <div className='container mx-auto'>
          <h1
            className='text-2xl font-bold cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300'
            onClick={() => navigate('/')}
          >
            S-Reboot
          </h1>
        </div>
      </header>

      <div className='flex-1 flex items-center justify-center p-6 relative z-10'>
        <div className='w-full max-w-md relative'>
          <Card className='w-full shadow-lg border border-gray-100 bg-white/95 backdrop-blur-sm animate-fade-in hover:shadow-xl transition-all duration-300'>
            <CardHeader className='space-y-1 pb-6'>
              <CardTitle className='text-2xl font-semibold text-gray-800'>
                {mode === 'login' ? 'Welcome back' : 'Create an Account'}
              </CardTitle>
              <CardDescription className='text-gray-500'>
                {mode === 'login'
                  ? 'Enter your credentials to access your journals'
                  : 'Fill out the form below to create your account'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className='space-y-5'>
                {mode === 'signup' && (
                  <div className='space-y-2'>
                    <label htmlFor='name' className='text-sm font-medium text-gray-700'>
                      Full Name
                    </label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                      <Input
                        id='name'
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder='John Doe'
                        required
                        className='pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200'
                      />
                    </div>
                  </div>
                )}
                <div className='space-y-2'>
                  <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='name@example.com'
                      required
                      className='pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                      Password
                    </label>
                    {mode === 'login' && (
                      <a
                        href='#'
                        className='text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200'
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      id='password'
                      type='password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='••••••••'
                      required
                      className='pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200'
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col space-y-3 pt-2'>
                <Button 
                  type='submit' 
                  className='w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-200' 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin inline' />
                      {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : mode === 'login' ? (
                    'Login'
                  ) : (
                    'Create Account'
                  )}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={toggleMode}
                  className='w-full text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200'
                >
                  {mode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Log in'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <footer className='bg-white/90 backdrop-blur-sm border-t border-gray-100 p-4 text-center text-gray-500 text-sm relative z-10'>
        <p>© {new Date().getFullYear()} Flowy Scribe. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
