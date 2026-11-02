import { describe, expect, it } from 'vitest';
import { authErrorMessage, isValidEmail } from './auth';

describe('authErrorMessage', () => {
  const cases: [unknown, RegExp][] = [
    [{ code: 'user_already_exists', message: 'User already registered' }, /already has a KaPamana account/],
    [{ code: 'invalid_credentials', message: 'Invalid login credentials' }, /email or password is incorrect/],
    [{ code: 'email_not_confirmed', message: 'Email not confirmed' }, /not confirmed yet/],
    [{ code: 'weak_password', message: 'Password should be at least 8 characters.' }, /stronger password/],
    [{ code: 'over_email_send_rate_limit', status: 429, message: 'email rate limit exceeded' }, /could not send a confirmation email/],
    [{ code: 'email_address_not_authorized', message: 'Email address not authorized' }, /could not send a confirmation email/],
    [{ code: 'over_request_rate_limit', status: 429, message: 'Request rate limit reached' }, /Too many attempts/],
    [{ name: 'AuthRetryableFetchError', message: 'Failed to fetch' }, /No internet connection/],
    [new TypeError('Failed to fetch'), /No internet connection/],
    [{ code: 'signup_disabled', message: 'Signups not allowed for this instance' }, /closed/],
    [{ message: 'Something odd' }, /Something odd/],
    [undefined, /Something went wrong/],
  ];
  it.each(cases)('%o', (error, expected) => { expect(authErrorMessage(error)).toMatch(expected); });
});

describe('isValidEmail', () => {
  it('accepts normal addresses and rejects malformed ones', () => {
    expect(isValidEmail(' bea@example.com ')).toBe(true);
    expect(isValidEmail('bea@example')).toBe(false);
    expect(isValidEmail('bea example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
