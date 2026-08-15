import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff, Key, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreateUserModal({ isOpen, onClose, onSuccess, oktaApi, showToast }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const generateStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const nums = '23456789';
    const specials = '!@#$%^&*';

    let pass = 'Okta#';
    pass += upper.charAt(Math.floor(Math.random() * upper.length));
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += specials.charAt(Math.floor(Math.random() * specials.length));
    pass += '2026';

    setPassword(pass);
    setShowPassword(true);
  };

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters with upper, lower, and numbers.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await oktaApi.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      showToast({
        type: 'success',
        title: 'User Provisioned in Okta',
        message: `Successfully created ${firstName} ${lastName} (${email}).`,
      });

      if (onSuccess) onSuccess(response.user);
      onClose();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not create Okta user.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box">
              <UserPlus size={20} color="#2563eb" />
            </div>
            <div>
              <h2 className="modal-title">Create Okta User</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Provision a new identity directly in your Okta tenant</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row-2col">
              {/* First Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="input-first-name">
                  First Name *
                </label>
                <input
                  type="text"
                  id="input-first-name"
                  className={`form-input ${errors.firstName ? 'has-error' : ''}`}
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && <div className="form-error-msg">{errors.firstName}</div>}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="input-last-name">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="input-last-name"
                  className={`form-input ${errors.lastName ? 'has-error' : ''}`}
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && <div className="form-error-msg">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-email">
                Email Address & Okta Login *
              </label>
              <input
                type="email"
                id="input-email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="form-error-msg">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="input-password" style={{ marginBottom: 0 }}>
                  Temporary Password *
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="btn btn-secondary btn-xs"
                >
                  <Sparkles size={12} color="#2563eb" />
                  <span>Generate Password</span>
                </button>
              </div>

              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-password"
                  className={`form-input ${errors.password ? 'has-error' : ''}`}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error-msg">{errors.password}</div>}
            </div>

            <div className="info-callout-box">
              <Key size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                Password must be at least 8 characters and satisfy Okta tenant complexity requirements (upper, lower, number).
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="btn-submit-create-user"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-sm" />
                  <span>Creating in Okta...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
