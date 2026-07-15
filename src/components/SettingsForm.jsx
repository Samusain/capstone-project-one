import React, { useState } from 'react';
import '../index.css';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    notifications: false,
    timezone: 'UTC',
    bio: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [bioCharCount, setBioCharCount] = useState(0);

  // Validation functions
  const validateEmail = (email) => {
    // Reject if email includes "+admin" (edge case per spec)
    if (email.includes('+admin')) {
      return false;
    }
    // Standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFullName = (name) => {
    // Min 2 chars, max 50, reject if only spaces
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!validateFullName(formData.fullName)) {
      newErrors.fullName = 'Name must be 2-50 characters';
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format or email already in use';
    }

    // Timezone is always valid (it's a select)
    // Notifications is always valid (it's a checkbox)
    // Bio max length is handled on input, no error needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'bio') {
      // Max 200 chars for bio
      const truncated = value.slice(0, 200);
      setFormData((prev) => ({ ...prev, [name]: truncated }));
      setBioCharCount(truncated.length);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleTimezoneChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, timezone: value }));
    // Optimistic UI: timezone updates immediately
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // All validation passed
    console.log('Form submitted:', formData);
    setSuccessMessage('Settings saved!');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    // Optional: Reset form or persist data
    // setFormData({ fullName: '', email: '', notifications: false, timezone: 'UTC', bio: '' });
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <h2 className="settings-form__title">Settings</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="settings-form__success">
          {successMessage}
        </div>
      )}

      {/* Full Name */}
      <div className="form-group">
        <label htmlFor="fullName" className="form-label">
          Full Name <span className="required-asterisk">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p id="fullName-error" className="error-message">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email <span className="required-asterisk">*</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p id="email-error" className="error-message">
            {errors.email}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div className="form-group">
        <label htmlFor="timezone" className="form-label">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleTimezoneChange}
          className="form-select"
        >
          <option value="UTC">UTC</option>
          <option value="EST">EST</option>
          <option value="PST">PST</option>
          <option value="IST">IST</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="form-group form-group--checkbox">
        <label htmlFor="notifications" className="checkbox-label">
          <input
            id="notifications"
            type="checkbox"
            name="notifications"
            checked={formData.notifications}
            onChange={handleInputChange}
            className="form-checkbox"
          />
          <span>Email me about updates</span>
        </label>
      </div>

      {/* Bio */}
      <div className="form-group">
        <label htmlFor="bio" className="form-label">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          maxLength="200"
          className="form-textarea"
          placeholder="Tell us about yourself"
          rows="4"
        />
        <p className="char-count">
          {bioCharCount}/200 characters
        </p>
      </div>

      {/* Submit Button */}
      <button type="submit" className="submit-button">
        Save Settings
      </button>
    </form>
  );
};

export default SettingsForm;