import {
  type DocumentNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type GraphQLInputType,
  type GraphQLObjectType,
  type GraphQLOutputType,
  isEnumType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  Kind,
  type OperationDefinitionNode,
  OperationTypeNode,
  parse,
  print,
} from 'graphql';

export enum OrderBy {
  Asc = 'ASC', // in ascending order, nulls last
  AscNullsFirst = 'ASC_NULLS_FIRST',
  AscNullsLast = 'ASC_NULLS_LAST',
  Desc = 'DESC', // in descending order, nulls first
  DescNullsFirst = 'DESC_NULLS_FIRST',
  DescNullsLast = 'DESC_NULLS_LAST',
}

export function getBaseType(type: GraphQLOutputType): GraphQLOutputType {
  if (isNonNullType(type) || isListType(type)) {
    return getBaseType(type.ofType);
  }
  return type;
}

export function getBaseInputType(type: GraphQLInputType): GraphQLInputType {
  if (isNonNullType(type) || isListType(type)) {
    return getBaseInputType(type.ofType);
  }
  return type;
}

export function getOutputTypeName(type: GraphQLOutputType): string {
  if (isObjectType(type) || isScalarType(type) || isEnumType(type)) {
    return type.name;
  }
  if (isListType(type) || isNonNullType(type)) {
    return getOutputTypeName(type.ofType);
  }
  throw new Error('Unknown type');
}

export function hasScalars(type: GraphQLObjectType): boolean {
  for (const field of Object.values(type.getFields())) {
    const baseFieldType = getBaseType(field.type);
    if (isScalarType(baseFieldType)) {
      return true;
    }
  }
  return false;
}

export function documentToString(document: DocumentNode | string): string {
  return typeof document === 'string' ? document : print(document);
}

export function documentToDocument(
  document: DocumentNode | string
): DocumentNode {
  return typeof document === 'string' ? parse(document) : document;
}

export function getFragmentDefinitions(
  fragment: DocumentNode | string
): FragmentDefinitionNode[] {
  const fragmentDoc = documentToDocument(fragment);
  return fragmentDoc.definitions.filter(
    (definition) => definition.kind === Kind.FRAGMENT_DEFINITION
  ) as FragmentDefinitionNode[];
}

export function getOperationFragmentSpreadNode(
  document: DocumentNode | string
): FragmentSpreadNode {
  const doc = documentToDocument(document);
  for (const definition of doc.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      for (const selection of definition.selectionSet.selections) {
        if (selection.kind === Kind.FIELD) {
          if (selection.selectionSet) {
            for (const fieldSelection of selection.selectionSet.selections) {
              if (fieldSelection.kind === Kind.FRAGMENT_SPREAD) {
                return fieldSelection;
              }
            }
          }
        }
      }
    }
  }
  throw new Error(`No fragment spread definition in document ${doc.kind}`);
}

export function getOperationName(
  document: DocumentNode | string
): string | undefined {
  const doc = documentToDocument(document);
  for (const definition of doc.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      return definition.name?.value;
    }
  }
  return undefined;
}

export function getOperationType(
  document: DocumentNode | string
): string | undefined {
  const doc = documentToDocument(document);
  for (const definition of doc.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      return definition.operation;
    }
  }
  return undefined;
}

export function replaceFragmentSpreadNameInOperationDefinition(
  definition: OperationDefinitionNode,
  name: string
): OperationDefinitionNode {
  return {
    ...definition,
    selectionSet: {
      ...definition.selectionSet,
      selections: definition.selectionSet.selections.map((selection) => {
        if (selection.kind === Kind.FIELD) {
          if (!selection.selectionSet) {
            return selection;
          }
          return {
            ...selection,
            selectionSet: {
              ...selection.selectionSet,
              selections: selection.selectionSet?.selections.map(
                (fieldSelection) => {
                  if (fieldSelection.kind === Kind.FRAGMENT_SPREAD) {
                    return {
                      kind: Kind.FRAGMENT_SPREAD,
                      name: { kind: Kind.NAME, value: name },
                    };
                  }
                  return selection;
                }
              ),
            },
          };
        }
        return selection;
      }),
    },
  };
}

export function replaceFragmentInDocument(
  document: DocumentNode | string,
  fragment: DocumentNode | string
): DocumentNode {
  const doc = documentToDocument(document);
  const fragmentDoc = documentToDocument(fragment);

  const fragmentDefinitions = getFragmentDefinitions(fragmentDoc);
  const firstFragmentDefinition = fragmentDefinitions[0];

  const definitionsWithoutFragments = doc.definitions
    .filter((definition) => definition.kind !== Kind.FRAGMENT_DEFINITION)
    .map((definition) => {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        return replaceFragmentSpreadNameInOperationDefinition(
          definition,
          firstFragmentDefinition?.name.value
        );
      }
      return definition;
    });

  return {
    ...doc,
    definitions: [...definitionsWithoutFragments, ...fragmentDefinitions],
  };
}

export function convertQueryToSubscription(
  document: DocumentNode | string
): DocumentNode {
  const doc = documentToDocument(document);
  const subscriptionDoc = {
    ...doc,
    definitions: doc.definitions.map((definition) => {
      if (
        definition.kind === Kind.OPERATION_DEFINITION &&
        definition.operation === OperationTypeNode.QUERY
      ) {
        return {
          ...definition,
          operation: OperationTypeNode.SUBSCRIPTION,
        };
      }
      return definition;
    }),
  };
  return subscriptionDoc;
}

export function hasuraCompare(a: any, b: any, orderBy: OrderBy): number {
  // asc: nulls first, desc: nulls last (https://hasura.io/docs/latest/queries/postgres/sorting/)
  // 0: a == b
  // negative: a before b
  // positive: a after b

  const emptyA = a === null || a === undefined;
  const emptyB = b === null || b === undefined;

  if (emptyA && emptyB) {
    return 0;
  }
  if (emptyA) {
    if (
      [OrderBy.Asc, OrderBy.AscNullsFirst, OrderBy.DescNullsFirst].includes(
        orderBy
      )
    ) {
      return -1;
    }
    return 1;
  }
  if (emptyB) {
    if (
      [OrderBy.Asc, OrderBy.AscNullsFirst, OrderBy.DescNullsFirst].includes(
        orderBy
      )
    ) {
      return 1;
    }
    return -1;
  }

  let ascendingResult: number;
  if (typeof a === 'string' && typeof b === 'string') {
    ascendingResult = a.localeCompare(b);
  } else {
    ascendingResult = a < b ? -1 : a > b ? 1 : 0;
  }
  const isAscending = [
    OrderBy.Asc,
    OrderBy.AscNullsFirst,
    OrderBy.AscNullsLast,
  ].includes(orderBy);

  return isAscending ? ascendingResult : ascendingResult * -1;
}
