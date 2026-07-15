import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsForm from './SettingsForm';

describe('SettingsForm', () => {
  // Test 1: Form renders with all fields and labels
  test('renders with all required labels', () => {
    render(<SettingsForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email me about updates/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  // Test 2: Shows validation errors for empty required fields
  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const submitButton = screen.getByRole('button', { name: /Save Settings/i });
    await user.click(submitButton);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  // Test 3: Shows validation error for invalid email format
  test('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
  });

  // Test 4: Shows success message on valid submit
  test('shows success message on valid submit', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    expect(screen.getByText('Settings saved!')).toBeInTheDocument();
  });

  // Test 5: Shows char count for bio textarea
  test('shows char count for bio textarea', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const bioInput = screen.getByLabelText(/Bio/i);
    await user.type(bioInput, 'Hello world');

    expect(screen.getByText('11/200 characters')).toBeInTheDocument();
  });

  // Test 6: Rejects email with "+admin" in it (edge case)
  test('rejects email containing "+admin"', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'john+admin@example.com');
    await user.click(submitButton);

    expect(screen.getByText(/Invalid email format or email already in use/i)).toBeInTheDocument();
  });

  // Test 7: Rejects name with only spaces
  test('rejects name with only spaces', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.type(fullNameInput, '   ');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
  });

  // Test 8: Success message disappears after 3 seconds
  test('success message disappears after 3 seconds', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    expect(screen.getByText('Settings saved!')).toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    expect(screen.queryByText('Settings saved!')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  // Test 9: Bio textarea limits to 200 characters
  test('bio textarea limits input to 200 characters', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const bioInput = screen.getByLabelText(/Bio/i);
    const longText = 'a'.repeat(250);

    await user.type(bioInput, longText);

    expect(bioInput.value).toHaveLength(200);
    expect(screen.getByText('200/200 characters')).toBeInTheDocument();
  });

  // Test 10: Timezone select updates correctly
  test('timezone select updates correctly', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const timezoneSelect = screen.getByLabelText(/Timezone/i);

    expect(timezoneSelect.value).toBe('UTC');

    await user.selectOptions(timezoneSelect, 'PST');

    expect(timezoneSelect.value).toBe('PST');
  });

  // Test 11: Notifications checkbox toggles
  test('notifications checkbox toggles on/off', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const notificationCheckbox = screen.getByLabelText(/Email me about updates/i);

    expect(notificationCheckbox).not.toBeChecked();

    await user.click(notificationCheckbox);

    expect(notificationCheckbox).toBeChecked();
  });

  // Test 12: Error messages have correct aria attributes
  test('error messages have aria-invalid and aria-describedby', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.click(submitButton);

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
  });

  // Test 13: Error clears when user starts typing
  test('error clears when user starts typing in field', async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const submitButton = screen.getByRole('button', { name: /Save Settings/i });

    await user.click(submitButton);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();

    await user.type(fullNameInput, 'J');

    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
  });
});