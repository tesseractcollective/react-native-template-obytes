import type { DocumentNode, GraphQLError } from 'graphql';

export type Fetch = typeof fetch;

export type Variables = Record<string, unknown>;

export interface GraphQLRequestContext<V extends Variables = Variables> {
  query: string | string[];
  variables?: V;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: unknown;
  status: number;
  [key: string]: unknown;
}

export type HTTPMethodInput = 'GET' | 'POST' | 'get' | 'post';

export interface RequestConfig extends Omit<RequestInit, 'headers' | 'method'> {
  fetch?: Fetch;
  method?: HTTPMethodInput;
  headers?: HeadersInit;
  requestMiddleware?: RequestMiddleware;
  responseMiddleware?: ResponseMiddleware;
  excludeOperationName?: boolean;
}

export type RequestDocument = string | DocumentNode;

export type RequestOptions<T, V extends Variables = Variables> = {
  document: RequestDocument;
  variables?: V;
  requestHeaders?: HeadersInit;
  signal?: RequestInit['signal'];
};

export type SubscriptionOptions<V extends Variables = Variables> = {
  document: RequestDocument;
  variables?: V;
};

export type ResponseMiddleware = (
  response: GraphQLClientResponse<unknown>,
  request: RequestInitExtended
) => Promise<void>;

export type RequestMiddleware<V extends Variables = Variables> = (
  request: RequestInitExtended<V>
) => RequestInitExtended | Promise<RequestInitExtended>;

export type RequestInitExtended<V extends Variables = Variables> =
  RequestInit & {
    url: string;
    operationName?: string;
    variables?: V;
  };

export interface GraphQLClientResponse<Data> {
  status: number;
  headers: Headers;
  data: Data;
  extensions?: unknown;
  errors?: GraphQLError[];
}
