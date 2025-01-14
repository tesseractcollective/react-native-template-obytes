import { Env } from '@env';
import { jwtDecode } from 'jwt-decode';
import { proxy } from 'valtio';

import GraphQLClient from '@/lib/graphql/graphql-client';
import Logger from '@/lib/logger';
import type {
  RequestMiddleware,
  ResponseMiddleware,
} from '@/types/graphql-client-types';

import { deleteStoredAnonymousId, deleteStoredToken } from './auth-storage';
// WARNING: Don't import from auth-state-actions here. It causes a circular dependency that crashes the app.

export type AuthRole = 'public' | 'anonymous' | 'user' | 'tenant_admin';

export class Token {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  get decoded(): Record<string, any> {
    return this.value ? jwtDecode<Record<string, any>>(this.value) : {};
  }
  get hasuraClaims(): Record<string, string> {
    return Env.JWT_CLAIMS_KEY ? (this.decoded[Env.JWT_CLAIMS_KEY] ?? {}) : {};
  }
  get profileId(): string {
    return this.hasuraClaims['x-hasura-user-id'] ?? '';
  }
  get role(): AuthRole {
    return (this.hasuraClaims['x-hasura-default-role'] as AuthRole) ?? 'public';
  }
  get tenantId(): string {
    return this.hasuraClaims['x-hasura-tenant-id'] ?? '';
  }
  get expiresAt(): Date {
    return new Date((this.decoded.exp ?? 0) * 1000);
  }
  get isExpired(): boolean {
    return this.decoded.exp && this.decoded.exp < Date.now() / 1000;
  }
  get issuedAt(): Date {
    return new Date((this.decoded.iat ?? 0) * 1000);
  }
  get audience(): string {
    return this.decoded.aud ?? '';
  }
}

export interface AuthState {
  token?: Token;
  loading: boolean;
  isInitialized: boolean;
}

export const authState = proxy<AuthState>({
  token: undefined,
  loading: false,
  isInitialized: false,
});

const authRequestMiddleware = (): RequestMiddleware => {
  return async (request) => {
    const variables =
      typeof request.body === 'string'
        ? JSON.parse(request.body).variables
        : {};
    const label = request.method === 'WS' ? 'subscription' : 'graphql';
    Logger.debug(label, request.operationName, JSON.stringify(variables));

    if (authState?.token?.audience != 'url for aud') {
    }
    if (authState?.token?.isExpired) {
      clearAuthState();

      throw new Error(
        JSON.stringify({
          message: 'Token expired',
          source: 'client',
          kind: 'expired',
          path: `graphql.${request.operationName}.middleware.token`,
        })
      );

      // TODO: handle expired token. try refresh token from session
    }
    return request;
  };
};

const authResponseMiddleware = (): ResponseMiddleware => {
  return async (response, request) => {
    const variables =
      typeof request.body === 'string'
        ? JSON.parse(request.body).variables
        : {};
    const label = request.method === 'WS' ? 'subscription' : 'graphql';
    Logger.error(
      label,
      request.operationName,
      response,
      JSON.stringify(variables)
    );

    if (Env.HASURA_GRAPHQL_ENDPOINT?.includes('localhost')) {
      // showMessage({ message: JSON.stringify(response), type: 'danger' });
    }
  };
};

function createRequestHeaders() {
  const token = authState.token;
  if (token) {
    return {
      Authorization: `Bearer ${token.value}`,
    };
  }
  return undefined;
}

export function clearAuthState() {
  authState.token = undefined;
  deleteStoredToken();
  deleteStoredAnonymousId();
}

export function authClient() {
  if (!Env.HASURA_GRAPHQL_ENDPOINT) {
    throw new Error('HASURA_GRAPHQL_ENDPOINT is not set');
  }
  return new GraphQLClient(Env.HASURA_GRAPHQL_ENDPOINT, {
    headers: createRequestHeaders(),
    requestMiddleware: authRequestMiddleware(),
    responseMiddleware: authResponseMiddleware(),
  });
}
