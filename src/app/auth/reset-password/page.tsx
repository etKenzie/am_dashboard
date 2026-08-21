'use client';

import Logo from '@/app/(DashboardLayout)/layout/shared/logo/Logo';
import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/app/context/AuthContext';
import { supabaseForPasswordReset } from '@/lib/supabaseClient';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const { resetPasswordWithToken } = useAuth();
  const router = useRouter();

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate the reset token on mount (only on client)
  useEffect(() => {
    if (!mounted) return;

    const validateToken = async () => {
      try {
        if (typeof window === 'undefined') return;

        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        // Preferred: token_hash from email template (works across browsers/devices)
        if (tokenHash && (type === 'recovery' || type === 'email')) {
          const { data, error: otpError } = await supabaseForPasswordReset.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          });

          if (otpError || !data.session) {
            setError(
              otpError?.message ||
                'Invalid or expired reset link. Please request a new password reset.',
            );
            setValidating(false);
            return;
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          setValidating(false);
          return;
        }

        // PKCE: ?code=... (must open in the SAME browser that requested the reset)
        if (code) {
          const { data, error: exchangeError } =
            await supabaseForPasswordReset.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Failed to exchange reset code:', exchangeError);
            const msg = exchangeError.message || '';
            if (msg.toLowerCase().includes('code verifier')) {
              setError(
                'This reset link must be opened in the same browser where you requested the password reset. Request a new reset email, then open the link in that same browser (don’t open it on another device).',
              );
            } else {
              setError(
                msg || 'Invalid or expired reset link. Please request a new password reset.',
              );
            }
            setValidating(false);
            return;
          }

          if (!data.session) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setValidating(false);
            return;
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          setValidating(false);
          return;
        }

        // Legacy hash tokens: #access_token=...&type=recovery
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          if (accessToken && hashType === 'recovery') {
            if (refreshToken) {
              const { error: setSessionError } = await supabaseForPasswordReset.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (setSessionError) {
                setError(
                  setSessionError.message ||
                    'Invalid or expired reset link. Please request a new password reset.',
                );
                setValidating(false);
                return;
              }
            } else {
              const { data: { session }, error: sessionError } =
                await supabaseForPasswordReset.auth.getSession();
              if (sessionError || !session) {
                setError(
                  sessionError?.message ||
                    'Invalid or expired reset link. Please request a new password reset.',
                );
                setValidating(false);
                return;
              }
            }

            window.history.replaceState({}, document.title, window.location.pathname);
            setValidating(false);
            return;
          }
        }

        setError('Invalid or expired reset link. Please request a new password reset.');
        setValidating(false);
      } catch (err: any) {
        console.error('Error validating token:', err);
        setError(err.message || 'Invalid or expired reset link. Please request a new password reset.');
        setValidating(false);
      }
    };

    validateToken();
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken(password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state until component is mounted (prevents hydration mismatch)
  if (!mounted || validating) {
    return (
      <PageContainer title="Reset Password" description="Reset your password">
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{
              xs: 12,
              sm: 12,
              lg: 5,
              xl: 4
            }}>
            <Box p={4} textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {!mounted ? 'Loading...' : 'Validating reset link...'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Reset Password" description="Reset your password">
      <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
        <Grid
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}>
          <Box position="relative">
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 75px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <Image
                src="/images/backgrounds/login-bg.svg"
                alt="bg" width={500} height={500}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '500px',
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size={{
            xs: 12,
            sm: 12,
            lg: 5,
            xl: 4
          }}>
          <Box p={4}>
            <Typography variant="h3" fontWeight="700" mb={1}>
              Reset Password
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mb={3}>
              Enter your new password below.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset successfully! Redirecting to login...
              </Alert>
            )}

            {!success ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size="large"
                  component={Link}
                  href="/auth/login"
                  sx={{ py: 1.5 }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                component={Link}
                href="/auth/login"
                sx={{ py: 1.5 }}
              >
                Go to Login
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

