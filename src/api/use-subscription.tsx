import { useEffect, useMemo, useState } from 'react';

import { authClient } from '@/lib/auth/auth-state';
import Logger from '@/lib/logger';
import type {
  SubscriptionOptions,
  Variables,
} from '@/types/graphql-client-types';

import { getOperationName } from '@/graphql/graphql-utils';

export interface UseSubscriptionOptions<V extends Variables = Variables>
  extends SubscriptionOptions<V> {
  enabled?: boolean;
  dataKey?: string;
}

export function useSubscription<TData = any, V extends Variables = Variables>(
  options: UseSubscriptionOptions<V>
) {
  const [data, setData] = useState<TData>();
  const [error, setError] = useState<Error | undefined>();
  const [dataUpdatedAt, setDataUpdatedAt] = useState<Date | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const client = useMemo(() => authClient(), []);
  const [serializedOptions, setSerializedOptions] = useState(() =>
    JSON.stringify(options)
  );

  const debugString =
    getOperationName(options.document) +
    ' ' +
    JSON.stringify(options.variables);
  useEffect(() => {
    const serialized = JSON.stringify(options);
    if (serialized !== serializedOptions) {
      setSerializedOptions(serialized);
    }
  }, [options]);

  useEffect(() => {
    const options: UseSubscriptionOptions<V> = JSON.parse(serializedOptions);
    if (!options.enabled) {
      return;
    }

    if (retryCount > 0) {
      Logger.debug('subscription retrying', retryCount, debugString);
    }

    const subscriptionDisposable = client.subscribe(
      {
        document: options.document,
        variables: options.variables,
      },
      {
        next: (value) => {
          if (value.data && options.dataKey) {
            setData(value.data[options.dataKey]);
          } else {
            setData(value.data);
          }
          setDataUpdatedAt(new Date());
        },
        error: (error) => {
          setError(error as Error);
        },
        complete: () => {},
      },
      (event: CloseEvent) => {
        Logger.debug(
          'subscription unexpected close code:',
          event.code,
          event.reason,
          debugString
        );
        setRetryCount((count) => count + 1);
      }
    );

    return () => {
      subscriptionDisposable?.();
      Logger.debug('subscription disposed', debugString);
    };
  }, [serializedOptions, retryCount]);

  return {
    data,
    error,
    dataUpdatedAt,
  };
}
