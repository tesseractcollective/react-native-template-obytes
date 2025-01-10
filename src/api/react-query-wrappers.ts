import type { QueryFunctionContext } from '@tanstack/react-query';
import Case from 'case';
import type { DocumentNode } from 'graphql';
import pluralize from 'pluralize';
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
  type QueryHook,
} from 'react-query-kit';

import { authClient } from '@/lib/auth/auth-state';
import { useSubscription } from '@/lib/hooks/use-subscription';

import {
  buildItemsWithAggregateQuery,
  type HasuraQueryVariables,
} from './hasura-builders';
import invalidateQueryAfterMutationMiddleware from './query-kit-middlewares/invalidate-query-after-mutation-middleware';

export { type ItemsWithAggregateResponse } from './hasura-builders';

export type Variables = Record<string, unknown>;

type PageParam = {
  limit: number;
  offset: number;
};

export function fetcherWrapper<Data, V extends Variables>(
  document: DocumentNode | string,
  dataKey?: string
): (variables: V, context: QueryFunctionContext) => Promise<Data> {
  return async (variables: V, context: QueryFunctionContext): Promise<Data> => {
    const client = authClient();
    const result = await client.request({
      document,
      variables,
      signal: context?.signal,
    });
    if (dataKey) {
      return result[dataKey];
    }
    return result;
  };
}

export function infiniteFetcherWrapper<Data, V extends Variables>(
  document: DocumentNode | string,
  dataKey?: string
): (
  variables: V,
  context: QueryFunctionContext<any, PageParam>
) => Promise<Data> {
  return async (
    variables: V,
    context: QueryFunctionContext<any, PageParam>
  ): Promise<Data> => {
    const client = authClient();
    let variablesWithPagination = variables;
    if (context.pageParam?.limit && context.pageParam.offset) {
      variablesWithPagination = {
        ...variables,
        limit: context.pageParam.limit,
        offset: context.pageParam.offset,
      };
    }
    const result = await client.request({
      document,
      variables: variablesWithPagination,
      signal: context?.signal,
    });
    if (dataKey) {
      return result[dataKey];
    }
    return result;
  };
}

export function mutationFnWrapper<Data, V extends Variables>(
  document: DocumentNode | string,
  dataKey?: string
): (variables: V) => Promise<Data> {
  return async (variables: V): Promise<Data> => {
    const client = authClient();
    const result = await client.request({ document, variables });
    if (dataKey) {
      return result[dataKey];
    }
    return result;
  };
}

export function createQueryWrapper<Data, V extends Variables>(
  document: DocumentNode | string,
  queryKey: [string],
  dataKey?: string
) {
  return createQuery<Data, V, Error>({
    queryKey,
    fetcher: fetcherWrapper<Data, V>(document, dataKey),
  });
}

export function createInfiniteQueryWrapper<
  Data,
  V extends HasuraQueryVariables,
>(
  document: DocumentNode | string,
  queryKey: [string],
  dataKey?: string,
  perPage?: number
) {
  const defaultPerPage = 100;
  const limit = perPage ?? defaultPerPage;
  return createInfiniteQuery<Data, V, Error, { limit: number; offset: number }>(
    {
      queryKey,
      fetcher: infiniteFetcherWrapper<Data, V>(document, dataKey),
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => ({
        limit,
        offset: lastPageParam.offset + limit,
      }),
      getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => ({
        limit,
        offset: firstPageParam.offset - limit,
      }),
      initialPageParam: { limit, offset: 0 },
    }
  );
}

export function createItemsWithAggregateQueryWrapper<
  Data,
  V extends HasuraQueryVariables,
>(typeName: string, fragmentDoc: DocumentNode) {
  const typeCamelCase = Case.camel(typeName);
  const typeCamelCasePlural = pluralize(typeCamelCase);
  const document = buildItemsWithAggregateQuery(typeName, fragmentDoc);
  return createQuery<Data, V, Error>({
    queryKey: [`${typeCamelCasePlural}WithAggregate`],
    fetcher: fetcherWrapper<Data, V>(document),
  });
}

export function createMutationWrapper<Data, V extends Variables>(
  document: DocumentNode,
  dataKey?: string
) {
  return createMutation<Data, V, Error>({
    mutationFn: mutationFnWrapper<Data, V>(document, dataKey),
  });
}

export function createMutationWrapperWithInvalidate<Data, V extends Variables>(
  document: DocumentNode,
  dataKey: string,
  queryKeysToInvalidate: QueryHook<any, any, Error>[]
) {
  return createMutation<Data, V, Error>({
    mutationFn: mutationFnWrapper<Data, V>(document, dataKey),
    use: [
      invalidateQueryAfterMutationMiddleware<Data, V, Error, unknown>(
        queryKeysToInvalidate,
        {
          method: 'onSuccess',
        }
      ),
    ],
  });
}

export function createSubscription<Data, V extends Variables>(
  document: DocumentNode,
  dataKey?: string
) {
  return ({ variables, enabled }: { variables?: V; enabled?: boolean }) => {
    return useSubscription<Data, V>({ document, variables, dataKey, enabled });
  };
}
