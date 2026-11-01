import { userRepository } from '@/lib/repositories/user.repository';
import { verifyPassword, signToken } from '@/lib/auth';
import type { LoginInput } from '@/lib/validation/auth';
import type { AuthUser } from '@/types/auth';

export class AuthenticationError extends Error {
  status: number;

  constructor(message: string = 'Invalid email or password', status: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export const authService = {
  /**
   * Authenticates user credentials, verifies password hash, and issues a signed JWT token.
   */
  async login(credentials: LoginInput): Promise<LoginResult> {
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new AuthenticationError('Invalid email or password', 401);
    }

    const isMatch = await verifyPassword(credentials.password, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password', 401);
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await signToken(authUser);

    return { user: authUser, token };
  },
};

