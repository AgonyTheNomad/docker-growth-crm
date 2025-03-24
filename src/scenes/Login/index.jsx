import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../services/firebaseConfig';
import { useAuth } from '../../services/UserContext';
import { deriveRoleAndSubRole } from '../../services/UserContext';
import GoogleIcon from '@mui/icons-material/Google';
import Alert from '@mui/material/Alert';
import {
  StyledButton,
  StyledDialog,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  LoadingIndicator,
} from '../../style';

// Constants
const ROUTES = {
  DEFAULT: '/growth-dashboard',
  REFERRER: '/referrer',
  HOME: '/',
};

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No user found with this email address.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in process was interrupted.',
  'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
  'role/not-found': 'Unable to derive role information. Please contact support.',
  'role/unauthorized': 'Access denied. This email address is not authorized.',
  default: 'Failed to sign in. Please try again.',
};

// Helper function to handle role storage
const storeUserRoles = (roleInfo, setUserRole, setSubRole) => {
  if (roleInfo.isMultiRole) {
    setUserRole(roleInfo.roles);
    setSubRole(roleInfo.subRoles);
    localStorage.setItem('userRole', JSON.stringify(roleInfo.roles || []));
    roleInfo.subRoles && localStorage.setItem('subRole', JSON.stringify(roleInfo.subRoles));
  } else {
    setUserRole(roleInfo.role || 'user');
    setSubRole(roleInfo.subRole || null);
    localStorage.setItem('userRole', roleInfo.role || 'user');
    roleInfo.subRole && localStorage.setItem('subRole', roleInfo.subRole);
  }
};

// Helper function to handle role redirection
const handleRoleRedirection = (roleInfo, navigate) => {
  const roles = roleInfo.isMultiRole ? roleInfo.roles : [roleInfo.role || roleInfo];
  const hasRole = (role) => roles.includes(role);

  if (hasRole('admin') || hasRole('franchise')) {
    navigate(ROUTES.DEFAULT);
  } else if (hasRole('referrer')) {
    navigate(ROUTES.REFERRER);
  } else {
    navigate(ROUTES.DEFAULT);
  }
};

// Helper function to parse stored role
const parseStoredRole = (storedRole) => {
  try {
    const parsedRole = JSON.parse(storedRole);
    return {
      isMultiRole: Array.isArray(parsedRole),
      roles: Array.isArray(parsedRole) ? parsedRole : [parsedRole],
      role: Array.isArray(parsedRole) ? parsedRole[0] : parsedRole,
    };
  } catch {
    return {
      isMultiRole: false,
      role: storedRole,
    };
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading, setUserRole, setSubRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      const storedRole = localStorage.getItem('userRole');
      if (!storedRole) return;

      try {
        const roleInfo = parseStoredRole(storedRole);
        handleRoleRedirection(roleInfo, navigate);
      } catch (err) {
        console.error('Error handling stored role:', err);
        navigate(ROUTES.HOME);
      }
    }
  }, [isLoggedIn, authLoading, navigate]);

  const handleAuthError = (err) => {
    console.error('Sign-in error:', err);
    setError(ERROR_MESSAGES[err.code] || ERROR_MESSAGES.default);
    return auth.signOut();
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting Google Sign-In...');
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.warn('Popup error, retrying with modified settings:', popupError);
        provider.setCustomParameters({ ...provider.customParameters, ux_mode: 'redirect' });
        result = await signInWithPopup(auth, provider);
      }

      const email = result.user.email;
      console.log('Authenticated User Email:', email);

      const roleInfo = deriveRoleAndSubRole(email);
      console.log('Derived Role Info:', roleInfo);

      if (!roleInfo) throw new Error('role/not-found');
      if (!roleInfo.role && !roleInfo.roles) throw new Error('role/not-found');
      if (roleInfo.role === 'user' && !roleInfo.subRole) throw new Error('role/unauthorized');

      storeUserRoles(roleInfo, setUserRole, setSubRole);
      handleRoleRedirection(roleInfo, navigate);
    } catch (err) {
      console.error('Detailed Sign-In Error:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <StyledDialog open maxWidth="xs" fullWidth>
        <DialogContent>
          <LoadingIndicator />
        </DialogContent>
      </StyledDialog>
    );
  }

  if (isLoggedIn) return null;

  return (
    <StyledDialog open maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h3" style={{ color: '#fff', marginBottom: '10px' }}>
          Welcome
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" style={{ color: '#fff', marginBottom: '20px' }}>
          Sign in to access your account
        </Typography>
        {error && (
          <Alert severity="error" style={{ marginBottom: '16px', color: '#ff6b6b' }}>
            {error}
          </Alert>
        )}
        <StyledButton
          variant="contained"
          startIcon={loading ? <LoadingIndicator /> : <GoogleIcon />}
          onClick={signInWithGoogle}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Signing In...' : 'Sign in with Google'}
        </StyledButton>
      </DialogContent>
      <DialogActions>
        <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          By signing in, you agree to our Terms of Service.
        </Typography>
      </DialogActions>
    </StyledDialog>
  );
};

export default Login;
