import React, { useMemo, useState } from 'react'

const initialState = {
  name: '',
  email: '',
  notifications: {
    marketing: true,
    productUpdates: true,
    security: true,
  },
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SettingsForm({ initialValues = initialState, onSave }) {
  const [values, setValues] = useState(() => initialValues)
  const [touched, setTouched] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const errors = useMemo(() => {
    const e = {}
    if (!values.name.trim()) e.name = 'Name is required.'
    if (!values.email.trim()) e.email = 'Email is required.'
    else if (!isValidEmail(values.email)) e.email = 'Enter a valid email address.'
    return e
  }, [values.email, values.name])

  const hasErrors = Object.keys(errors).length > 0

  function setField(path, next) {
    setValues((prev) => {
      if (path === 'name') return { ...prev, name: next }
      if (path === 'email') return { ...prev, email: next }
      return prev
    })
  }

  function setNotification(key, next) {
    setValues((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: next },
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setTouched({ name: true, email: true })

    if (hasErrors) return

    setSaving(true)
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        notifications: values.notifications,
      }

      // Default save behavior: simulate an async request.
      // If parent supplies onSave, use it.
      if (onSave) {
        await onSave(payload)
      } else {
        await new Promise((r) => setTimeout(r, 700))
      }

      setSavedAt(new Date())
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const showNameError = touched.name && errors.name
  const showEmailError = touched.email && errors.email

  return (
    <div className="sf-wrap">
      <div className="sf-card" role="region" aria-label="Settings">
        <header className="sf-header">
          <div>
            <h1 className="sf-title">Settings</h1>
            <p className="sf-subtitle">Update your profile and notification preferences.</p>
          </div>
          {savedAt ? (
            <div className="sf-saved" aria-live="polite">
              Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : null}
        </header>

        <form className="sf-form" onSubmit={handleSubmit} noValidate>
          <section className="sf-section">
            <h2 className="sf-sectionTitle">Profile</h2>

            <label className="sf-label" htmlFor="sf-name">
              Name
              <input
                id="sf-name"
                className={`sf-input ${showNameError ? 'sf-inputError' : ''}`}
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            {showNameError ? <div className="sf-error">{errors.name}</div> : null}

            <label className="sf-label" htmlFor="sf-email">
              Email
              <input
                id="sf-email"
                className={`sf-input ${showEmailError ? 'sf-inputError' : ''}`}
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </label>
            {showEmailError ? <div className="sf-error">{errors.email}</div> : null}
          </section>

          <section className="sf-section">
            <h2 className="sf-sectionTitle">Notifications</h2>

            <div className="sf-checkRow">
              <label className="sf-check">
                <input
                  type="checkbox"
                  checked={values.notifications.marketing}
                  onChange={(e) => setNotification('marketing', e.target.checked)}
                />
                <span>
                  Marketing emails
                  <span className="sf-checkHint">Occasional updates and offers.</span>
                </span>
              </label>
            </div>

            <div className="sf-checkRow">
              <label className="sf-check">
                <input
                  type="checkbox"
                  checked={values.notifications.productUpdates}
                  onChange={(e) => setNotification('productUpdates', e.target.checked)}
                />
                <span>
                  Product updates
                  <span className="sf-checkHint">New features and improvements.</span>
                </span>
              </label>
            </div>

            <div className="sf-checkRow">
              <label className="sf-check">
                <input
                  type="checkbox"
                  checked={values.notifications.security}
                  onChange={(e) => setNotification('security', e.target.checked)}
                />
                <span>
                  Security alerts
                  <span className="sf-checkHint">Critical account safety notices.</span>
                </span>
              </label>
            </div>
          </section>

          <footer className="sf-footer">
            {submitError ? <div className="sf-submitError">{submitError}</div> : null}

            <button
              type="submit"
              className="sf-submit"
              disabled={saving}
              aria-disabled={saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            <div className="sf-footnote">
              Your preferences are stored securely.
            </div>
          </footer>
        </form>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
  .sf-wrap {
    display: flex;
    justify-content: center;
    padding: 28px 16px;
  }

  .sf-card {
    width: 100%;
    max-width: 860px;
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(17, 24, 39, 0.10);
    box-shadow: 0 20px 50px rgba(16, 24, 40, 0.10);
    border-radius: 18px;
    overflow: hidden;
    backdrop-filter: blur(8px);
  }

  .sf-header {
    padding: 20px 22px 12px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .sf-title {
    margin: 0;
    font-size: 26px;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .sf-subtitle {
    margin: 6px 0 0;
    color: #475569;
    font-size: 14px;
  }

  .sf-saved {
    margin-top: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.12);
    color: #0f766e;
    border: 1px solid rgba(16, 185, 129, 0.25);
    font-size: 13px;
    white-space: nowrap;
  }

  .sf-form {
    padding: 8px 22px 22px;
    display: grid;
    gap: 18px;
  }

  .sf-section {
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(17, 24, 39, 0.08);
    border-radius: 14px;
    padding: 16px;
  }

  .sf-sectionTitle {
    margin: 0 0 12px;
    font-size: 15px;
    color: #0f172a;
    letter-spacing: 0.01em;
  }

  .sf-label {
    display: block;
    font-size: 13px;
    color: #334155;
    margin-bottom: 10px;
  }

  .sf-input {
    width: 100%;
    margin-top: 6px;
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    background: rgba(255, 255, 255, 0.9);
    outline: none;
    font-size: 14px;
    color: #0f172a;
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }

  .sf-input:focus {
    border-color: rgba(59, 130, 246, 0.55);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
  }

  .sf-inputError {
    border-color: rgba(239, 68, 68, 0.7);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
  }

  .sf-error {
    margin: -6px 0 10px;
    font-size: 13px;
    color: #b91c1c;
  }

  .sf-checkRow {
    padding: 4px 0;
  }

  .sf-check {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 14px;
    color: #0f172a;
    cursor: pointer;
    user-select: none;
  }

  .sf-check input {
    margin-top: 3px;
    width: 18px;
    height: 18px;
    accent-color: #2563eb;
  }

  .sf-checkHint {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: #64748b;
  }

  .sf-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  .sf-submit {
    appearance: none;
    border: 0;
    border-radius: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: white;
    font-weight: 650;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25);
    transition: transform 120ms ease, filter 120ms ease;
  }

  .sf-submit:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
  }

  .sf-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    filter: none;
    box-shadow: none;
  }

  .sf-submitError {
    color: #b91c1c;
    background: rgba(239, 68, 68, 0.10);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
    flex: 1 1 280px;
  }

  .sf-footnote {
    color: #64748b;
    font-size: 13px;
  }
`

