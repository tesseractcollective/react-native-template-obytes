import Case from 'case';
import { type DocumentNode, Kind, print } from 'graphql';
import type { Exact, InputMaybe, Scalars } from '@/api/generated/user-hooks';

export type SortOrder = 1 | 0 | -1 | null | undefined;

export type HasuraQueryVariables = Exact<{
  distinctOn?: InputMaybe<unknown>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<unknown>;
  where?: InputMaybe<unknown>;
}>;

export interface ItemsWithAggregateResponse<T> {
  items: T[];
  aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export function buildItemsWithAggregateQuery(
  typeName: string,
  fragmentDoc: DocumentNode
): string {
  const fragmentDefinition = fragmentDoc.definitions.find(
    (node) => node.kind === Kind.FRAGMENT_DEFINITION
  );
  if (
    !fragmentDefinition ||
    fragmentDefinition.kind !== Kind.FRAGMENT_DEFINITION
  ) {
    throw new Error(
      `document node does not have a fragment ${print(fragmentDoc)}`
    );
  }
  const fieldsFragmentName = fragmentDefinition.name.value;
  const typeNameCamel = Case.camel(typeName);
  const typeNamePascal = Case.pascal(typeName);

  return `
  query ${typeNameCamel}List(
    $where: ${typeNamePascal}BoolExp
    $orderBy: [${typeNamePascal}OrderBy!]
    $offset: Int
    $limit: Int
    $distinctOn: [${typeNamePascal}SelectColumn!]
  ) {
    items: ${typeNameCamel}(
      where: $where
      orderBy: $orderBy
      offset: $offset
      limit: $limit
      distinctOn: $distinctOn
    ) {
      ...${fieldsFragmentName}
    }
    aggregate: ${typeNameCamel}Aggregate(
      where: $where
      distinctOn: $distinctOn
    ) {
      aggregate {
        count
      }
    }
  }
  ${print(fragmentDoc)}`;
}

export function buildObjectForPath(
  path: string[],
  leafValue: any
): Record<string, any> {
  const [part, ...rest] = path;
  if (rest.length) {
    return {
      [part]: buildObjectForPath(rest, leafValue),
    };
  }
  return {
    [part]: leafValue,
  };
}

export function buildOrderBy(
  sortField?: string,
  sortOrder?: SortOrder
): Record<string, string> | undefined {
  // TODO: handle multiSort
  const sortMap = {
    '1': 'ASC_NULLS_LAST',
    '-1': 'DESC_NULLS_LAST',
  };

  if (!sortOrder || !sortField) {
    return undefined;
  }
  const hasuraSortDirection = sortMap[`${sortOrder}`];
  if (hasuraSortDirection) {
    const path = sortField.split('.');
    return buildObjectForPath(path, hasuraSortDirection);
  }
  return undefined;
}
