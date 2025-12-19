import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL hash or query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = queryParams.get('error') || hashParams.get('error');
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed. Please try again.');
          return;
        }

        // If we have tokens in the hash, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }
        }

        // Get the current session to verify authentication
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          throw getSessionError;
        }

        if (session) {
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          
          // Short delay before redirect for user feedback
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          // No session found, might be using PKCE flow
          // The onAuthStateChange listener will handle the session
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('success');
              setMessage('Successfully signed in! Redirecting...');
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 1500);
              subscription.unsubscribe();
            }
          });

          // Timeout after 10 seconds
          setTimeout(() => {
            if (status === 'loading') {
              setStatus('error');
              setMessage('Authentication timed out. Please try again.');
              subscription.unsubscribe();
            }
          }, 10000);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate, status]);

  return (
    <>
      <SEOHead 
        title="Authenticating... - LocalJobzz"
        description="Completing your sign in to LocalJobzz"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 text-orange-500 animate-spin mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Completing Sign In...
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your account.
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to LocalJobzz! 🎉
                  </h1>
                  <p className="text-gray-600">{message}</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Authentication Failed
                  </h1>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/signup')}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                    >
                      Back to Home
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCallback;
