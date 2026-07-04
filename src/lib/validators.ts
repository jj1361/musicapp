export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
}

export function validateRequired(
  fields: Record<string, unknown>,
  required: string[]
): string[] {
  const errors: string[] = [];
  for (const field of required) {
    if (!fields[field] || (typeof fields[field] === 'string' && !(fields[field] as string).trim())) {
      errors.push(`${field} is required`);
    }
  }
  return errors;
}
