import { describe, it, expect } from 'vitest';
import { authService, AuthenticationError } from '@/lib/services/auth.service';
import { userRepository } from '@/lib/repositories/user.repository';

describe('AuthService & UserRepository Layers', () => {
  it('userRepository finds user by email', async () => {
    const user = await userRepository.findByEmail('admin@cricket.com');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@cricket.com');
    expect(user?.role).toBe('ADMIN');
  });

  it('userRepository returns null for nonexistent email', async () => {
    const user = await userRepository.findByEmail('doesnotexist@example.com');
    expect(user).toBeNull();
  });

  it('authService.login returns user and token for valid credentials', async () => {
    const result = await authService.login({
      email: 'admin@cricket.com',
      password: 'admin123',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('admin@cricket.com');
    expect(result.user.role).toBe('ADMIN');
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
  });

  it('authService.login throws AuthenticationError for wrong password', async () => {
    await expect(
      authService.login({
        email: 'admin@cricket.com',
        password: 'incorrectPassword',
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it('authService.login throws AuthenticationError for nonexistent email', async () => {
    await expect(
      authService.login({
        email: 'nobody@cricket.com',
        password: 'anyPassword',
      })
    ).rejects.toThrow(AuthenticationError);
  });
});

