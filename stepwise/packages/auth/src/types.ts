/**
 * AuthPayload — the data encoded inside every StepWise JWT.
 *
 * Kept minimal on purpose: sub (user DB id), email, optional username.
 * Any consumer (CLI, API middleware, future NextAuth) decodes to this shape.
 */
export interface AuthPayload {
  /** DB user id (cuid) */
  sub: string;
  email: string;
  username?: string;
}

/**
 * AuthContext — the decoded, verified identity attached to every
 * authenticated request. In API: request.user. In NextAuth: session.user.
 */
export interface AuthContext extends AuthPayload {
  /** ISO string of token expiry */
  expiresAt: string;
}

/**
 * StoredCredentials — what the CLI writes to ~/.config/stepwise/credentials.json
 */
export interface StoredCredentials {
  token: string;
  email: string;
  userId: string;
  username?: string;
  expiresAt: string;
}
