import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({
  isOpen,
  initialMode = 'LOGIN', // 'LOGIN' or 'SIGNUP'
  initialRole = 'Administrator', // 'Administrator' or 'User'
  onClose,
  onSuccess,
  oktaApi,
  showToast,
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);

  // Form State - core 4 user attributes (always kept blank on open)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state whenever modal opens or props change - always keep fields blank
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setErrorMessage('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode, initialRole]);

  // Password Policy Checks (for user's chosen password)
  const passwordChecks = useMemo(() => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const matches = password && confirmPassword && password === confirmPassword;
    const isValid = minLength && hasUpper && hasLower && hasNumber && matches;

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      matches,
      isValid,
    };
  }, [password, confirmPassword]);

  if (!isOpen) return null;

  const generateStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const nums = '23456789';
    const specials = '!@#$%^&*';

    let pass = 'Okta#';
    pass += upper.charAt(Math.floor(Math.random() * upper.length));
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += specials.charAt(Math.floor(Math.random() * specials.length));

    setPassword(pass);
    setConfirmPassword(pass);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your Okta username or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await oktaApi.login({
        username: email.trim(),
        password,
        role,
      });

      if (response && response.success) {
        // Enforce: Only Okta Super Administrators can access the Administrator Dashboard
        if (role === 'Administrator' && !response.isSuperAdmin) {
          setErrorMessage('Access Denied: Only Okta Super Administrators have privilege to access the Administrator Dashboard. Your account does not have Super Admin permissions in Okta.');
          return;
        }

        onSuccess({
          user: response.user,
          role: response.role || (response.isSuperAdmin ? 'Administrator' : 'User'),
          sessionToken: response.sessionToken,
          isSuperAdmin: !!response.isSuperAdmin,
        });
        onClose();
      } else {
        setErrorMessage(response.error || 'Authentication failed. Please verify credentials in Okta tenant.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Check Okta connection and credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and Last name are required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please choose your password.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Password must include uppercase, lowercase, and numeric characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await oktaApi.signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      if (response && response.success) {
        if (showToast) {
          showToast({
            type: 'success',
            title: 'Account Provisioned in Okta!',
            message: `Successfully registered ${firstName} ${lastName} (${email}).`,
          });
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Self-registered users are regular users
        onSuccess({
          user: response.user,
          role: 'User',
          isSuperAdmin: false,
        });
        onClose();
      } else {
        setErrorMessage(response.error || 'Failed to create user in Okta.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="auth-modal-header">
          <div className="brand-logo-area">
            <div className="okta-sunburst-logo small">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="3" strokeDasharray="3 3" />
                <circle cx="12" cy="12" r="4" fill="#2563eb" />
              </svg>
            </div>
            <div>
              <h3 className="auth-modal-title">
                {mode === 'LOGIN' ? 'Sign In with Okta' : 'Create Okta Account'}
              </h3>
              <p className="auth-modal-sub">
                Enterprise Identity Orchestrator
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs (Log In vs Sign Up) */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'LOGIN' ? 'active' : ''}`}
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage('');
              setEmail('');
              setPassword('');
            }}
            id="tab-mode-login"
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'SIGNUP' ? 'active' : ''}`}
            onClick={() => {
              setMode('SIGNUP');
              setErrorMessage('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFirstName('');
              setLastName('');
            }}
            id="tab-mode-signup"
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector Tabs (Only in LOGIN mode) */}
        {mode === 'LOGIN' && (
          <div className="auth-role-picker">
            <div className="role-picker-label">Select Destination Portal:</div>
            <div className="role-picker-options">
              <button
                type="button"
                className={`role-option-btn ${role === 'Administrator' ? 'selected admin' : ''}`}
                onClick={() => {
                  setRole('Administrator');
                  setErrorMessage('');
                  setEmail('');
                  setPassword('');
                }}
                id="role-select-admin"
              >
                <Shield size={16} />
                <span>Administrator</span>
              </button>

              <button
                type="button"
                className={`role-option-btn ${role === 'User' ? 'selected user' : ''}`}
                onClick={() => {
                  setRole('User');
                  setErrorMessage('');
                  setEmail('');
                  setPassword('');
                }}
                id="role-select-user"
              >
                <UserCheck size={16} />
                <span>User</span>
              </button>
            </div>
            {role === 'Administrator' && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
                🔒 Okta Super Administrator privilege verified upon authentication
              </p>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-error-banner">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Okta Username / Email *
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="text"
                  id="login-email"
                  className="form-input"
                  placeholder="e.g. user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                  Okta Password *
                </label>
              </div>

              <div className="input-with-icon password-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
              id="btn-submit-login"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-sm" />
                  <span>Verifying with Okta...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Sign In as {role}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Sign Up Form (Choose Own Password) */}
        {mode === 'SIGNUP' && (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-firstname">
                  First Name *
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    id="signup-firstname"
                    className="form-input"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-lastname">
                  Last Name *
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    id="signup-lastname"
                    className="form-input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                Work Email Address (Okta Login) *
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="signup-email"
                  className="form-input"
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Choose Own Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="signup-password" style={{ marginBottom: 0 }}>
                  Choose Your Password *
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="btn btn-secondary btn-xs"
                  title="Generate a compliant suggestion"
                >
                  <Sparkles size={12} color="#2563eb" />
                  <span>Suggest Password</span>
                </button>
              </div>

              <div className="input-with-icon password-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  className="form-input"
                  placeholder="Type your chosen password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm-password">
                Confirm Password *
              </label>
              <div className="input-with-icon password-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="signup-confirm-password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Real-time Okta Password Requirements Visual Guide */}
            {password && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordChecks.minLength ? '#10b981' : '#64748b' }}>
                  {passwordChecks.minLength ? <Check size={13} color="#10b981" /> : <span style={{ width: '13px', textAlign: 'center' }}>•</span>}
                  <span>8+ characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordChecks.hasUpper ? '#10b981' : '#64748b' }}>
                  {passwordChecks.hasUpper ? <Check size={13} color="#10b981" /> : <span style={{ width: '13px', textAlign: 'center' }}>•</span>}
                  <span>1 uppercase (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordChecks.hasLower ? '#10b981' : '#64748b' }}>
                  {passwordChecks.hasLower ? <Check size={13} color="#10b981" /> : <span style={{ width: '13px', textAlign: 'center' }}>•</span>}
                  <span>1 lowercase (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordChecks.hasNumber ? '#10b981' : '#64748b' }}>
                  {passwordChecks.hasNumber ? <Check size={13} color="#10b981" /> : <span style={{ width: '13px', textAlign: 'center' }}>•</span>}
                  <span>1 number (0-9)</span>
                </div>
                {confirmPassword && (
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px', color: passwordChecks.matches ? '#10b981' : '#ef4444' }}>
                    {passwordChecks.matches ? <Check size={13} color="#10b981" /> : <span style={{ width: '13px', textAlign: 'center' }}>•</span>}
                    <span>{passwordChecks.matches ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
              id="btn-submit-signup"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-sm" />
                  <span>Provisioning Account in Okta...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
