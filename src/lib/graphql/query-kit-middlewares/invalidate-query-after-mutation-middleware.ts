import {
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import lodash from 'lodash';
import type { Middleware, MutationHook, QueryHook } from 'react-query-kit';

type GuardFunctionOnSuccess<TData, TVariables, TContext> = (
  data: TData,
  variables: TVariables,
  context: TContext
) => boolean;

type GuardFunctionOnSettled<TData, TError, TVariables, TContext> = (
  data: TData | undefined,
  error: TError | null,
  variables: TVariables,
  context: TContext | undefined
) => boolean;

interface FiltersInvalidateEntry {
  type: 'filters';
  queryFilters: InvalidateQueryFilters;
}

interface GuardInvalidateEntryOnSuccess<TData, TVariables, TContext> {
  type: 'guard';
  queryFilters: InvalidateQueryFilters;
  guard: GuardFunctionOnSuccess<TData, TVariables, TContext>;
}

interface GuardInvalidateEntryOnSettled<TData, TError, TVariables, TContext> {
  type: 'guard';
  queryFilters: InvalidateQueryFilters;
  guard: GuardFunctionOnSettled<TData, TError, TVariables, TContext>;
}

type InvalidateEntryOnSuccess<TData, TVariables, TContext> =
  | FiltersInvalidateEntry
  | GuardInvalidateEntryOnSuccess<TData, TVariables, TContext>;

type InvalidateEntryOnSettled<TData, TError, TVariables, TContext> =
  | FiltersInvalidateEntry
  | GuardInvalidateEntryOnSettled<TData, TError, TVariables, TContext>;

type InvalidateEntriesOnSuccess<TData, TVariables, TContext> = (
  | QueryHook<TData, TVariables, Error>
  | QueryKey
)[];
// | InvalidateEntryOnSuccess<TData, TVariables, TContext>

type InvalidateEntriesOnSettled<TData, TError, TVariables, TContext> = (
  | QueryHook<TData, TVariables, Error>
  | QueryKey
)[];
// | InvalidateEntryOnSettled<TData, TError, TVariables, TContext>

function invalidateQueriesAfterMutationMiddleware<
  TData,
  TVariables,
  TError,
  TContext,
>(
  entries: InvalidateEntriesOnSuccess<TData, TVariables, TContext>,
  options: {
    method?: 'onSuccess';
    invalidateOptions?: InvalidateOptions;
    waitForInvalidation?: boolean;
  }
): Middleware<MutationHook<TData, TVariables, TError, TContext>>;

function invalidateQueriesAfterMutationMiddleware<
  TData,
  TVariables,
  TError,
  TContext,
>(
  entries: InvalidateEntriesOnSettled<TData, TError, TVariables, TContext>,
  options?: {
    method?: 'onSettled';
    invalidateOptions?: InvalidateOptions;
    waitForInvalidation?: boolean;
  }
): Middleware<MutationHook<TData, TVariables, TError, TContext>>;

function invalidateQueriesAfterMutationMiddleware<
  TData,
  TVariables,
  TError,
  TContext,
>(
  entries:
    | InvalidateEntriesOnSuccess<TData, TVariables, TContext>
    | InvalidateEntriesOnSettled<TData, TError, TVariables, TContext>,
  options?: {
    method?: 'onSuccess' | 'onSettled';
    invalidateOptions?: InvalidateOptions;
    waitForInvalidation?: boolean;
  }
): Middleware<MutationHook<TData, TVariables, TError, TContext>> {
  return (useMutationNext) => {
    return (mutationOptions) => {
      const queryClient = useQueryClient();

      const method = options?.method ?? 'onSettled';
      const shouldWaitForInvalidation = options?.waitForInvalidation ?? false;

      if (method === 'onSuccess') {
        const onSuccess = async (
          data: TData,
          variables: TVariables,
          context: TContext
        ) => {
          const invalidationPromises: Promise<void>[] = [];

          for (const entry of entries as InvalidateEntriesOnSuccess<
            TData,
            TVariables,
            TContext
          >) {
            if (Array.isArray(entry)) {
              const queryKey = entry;
              const promise = queryClient.invalidateQueries(
                { queryKey },
                options?.invalidateOptions
              );
              invalidationPromises.push(promise);
            } else if ('getKey' in entry) {
              const hook = entry as QueryHook<TData, TVariables, Error>;
              if ('getKey' in entry) {
                //expand this to handle where clause & {_eq: ...}
                const recordId: string | undefined =
                  lodash.get(variables, 'id') ??
                  (lodash.get(data, 'id') as any);
                if (recordId) {
                  const queryKey = hook.getKey({ id: recordId } as any);
                  const promise = queryClient.invalidateQueries(
                    { queryKey },
                    options?.invalidateOptions
                  );
                  invalidationPromises.push(promise);
                }
              }
            } else {
              // const keyEntry = entry as InvalidateEntryOnSuccess<TData, TVariables, TContext>
              // // Entry is InvalidateEntryOnSuccess
              // if (keyEntry.type === 'filters') {
              //   const promise = queryClient.invalidateQueries(keyEntry.queryFilters, options?.invalidateOptions)
              //   invalidationPromises.push(promise)
              // } else if (keyEntry.type === 'guard') {
              //   if (keyEntry.guard(data, variables, context)) {
              //     const promise = queryClient.invalidateQueries(keyEntry.queryFilters, options?.invalidateOptions)
              //     invalidationPromises.push(promise)
              //   }
              // }
            }
          }

          if (shouldWaitForInvalidation) {
            await Promise.all(invalidationPromises);
          }

          const originalOnSuccess = mutationOptions.onSuccess;
          const result = originalOnSuccess?.(data, variables, context);

          if (shouldWaitForInvalidation && result instanceof Promise) {
            await result;
          }
        };

        return useMutationNext({ ...mutationOptions, onSuccess });
      } else if (method === 'onSettled') {
        const onSettled = async (
          data: TData | undefined,
          error: TError | null,
          variables: TVariables,
          context: TContext | undefined
        ) => {
          const invalidationPromises: Promise<void>[] = [];

          for (const entry of entries as InvalidateEntriesOnSettled<
            TData,
            TError,
            TVariables,
            TContext
          >) {
            if (Array.isArray(entry)) {
              const queryKey = entry;
              const promise = queryClient.invalidateQueries(
                { queryKey },
                options?.invalidateOptions
              );
              invalidationPromises.push(promise);
            } else if ('getKey' in entry) {
              const hook = entry as QueryHook<TData, TVariables, Error>;
              if ('getKey' in entry) {
                const recordId: string | undefined =
                  lodash.get(variables, 'id') ??
                  (lodash.get(data, 'id') as any);
                if (recordId) {
                  const queryKey = hook.getKey({ id: recordId } as any);
                  const promise = queryClient.invalidateQueries(
                    { queryKey },
                    options?.invalidateOptions
                  );
                  invalidationPromises.push(promise);
                }
              }
            } else {
              // const keyEntry = entry as InvalidateEntryOnSettled<TData, TError, TVariables, TContext>
              // // Entry is InvalidateEntryOnSettled
              // if (keyEntry.type === 'filters') {
              //   const promise = queryClient.invalidateQueries(keyEntry.queryFilters, options?.invalidateOptions)
              //   invalidationPromises.push(promise)
              // } else if (keyEntry.type === 'guard') {
              //   if (keyEntry.guard(data, error, variables, context)) {
              //     const promise = queryClient.invalidateQueries(keyEntry.queryFilters, options?.invalidateOptions)
              //     invalidationPromises.push(promise)
              //   }
              // }
            }
          }

          if (shouldWaitForInvalidation) {
            await Promise.all(invalidationPromises);
          }

          const originalOnSettled = mutationOptions.onSettled;
          const result = originalOnSettled?.(data, error, variables, context);

          if (shouldWaitForInvalidation && result instanceof Promise) {
            await result;
          }
        };

        return useMutationNext({ ...mutationOptions, onSettled });
      }

      return useMutationNext(mutationOptions);
    };
  };
}

export default invalidateQueriesAfterMutationMiddleware;
