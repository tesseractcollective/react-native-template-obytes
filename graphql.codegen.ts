import type { CodegenConfig } from '@graphql-codegen/cli';
import type { Types } from '@graphql-codegen/plugin-helpers';
import Case from 'case';
import type { IGraphQLConfig } from 'graphql-config';

import hasuraMetadata from './hasura/generated/metadata.json';
import hasuraKeys from './hasura/generated/table-keys.json';

require('dotenv').config();

const hasuraScalars = {
  citext: { input: 'string', output: 'string' },
  date: { input: 'string', output: 'string' },
  jsonb: { input: 'Record<string, any>', output: 'Record<string, any>' },
  numeric: { input: 'number', output: 'number' },
  timestamptz: { input: 'string', output: 'string' },
  timetz: { input: 'string', output: 'string' },
  uuid: { input: 'string', output: 'string' },
};

const graphqlUrlRoot = process.env.HASURA_GRAPHQL_ENDPOINT?.endsWith(
  '/v1/graphql'
)
  ? process.env.HASURA_GRAPHQL_ENDPOINT.substring(
      0,
      process.env.HASURA_GRAPHQL_ENDPOINT.indexOf('/v1/graphql')
    )
  : process.env.HASURA_GRAPHQL_ENDPOINT;

function schemaConfig(role?: string) {
  const headers: Record<string, string> = {
    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET as string,
  };
  if (role) {
    headers['x-hasura-role'] = role;
  }
  return {
    [graphqlUrlRoot + '/v1/graphql']: { headers },
  };
}

function updateGraphqlReactQueryContent(content: string): string {
  let newContent = content;
  newContent = newContent.replace(
    `import { RequestInit } from 'graphql-request/dist/types.dom';`,
    `type RequestInit = { headers: Record<string, string> };`
  );
  return newContent;
}

function updateGraphqlRequestImports(content: string): string {
  let newContent = content;
  newContent = newContent.replace(
    `import { GraphQLClient, RequestOptions } from 'graphql-request';`,
    `import { GraphQLClient, type RequestOptions } from 'graphql-request';`
  );
  newContent = newContent.replace(
    `import { DocumentNode } from 'graphql';`,
    `import type { DocumentNode } from 'graphql';`
  );
  return newContent;
}

const typescriptPlugins: Types.OutputConfig[] = [
  { add: { content: '/* eslint-disable */\n' } },
  'typescript',
  {
    'typescript-operations': {
      immutableTypes: true,
      printFieldsOnNewLines: true,
    },
  },
];

const documentPlugin: Types.OutputConfig = {
  'typescript-document-nodes': {
    nameSuffix: 'Doc',
    fragmentSuffix: 'FragmentDoc',
  },
};

const scalarsConfig = {
  scalars: hasuraScalars,
  strictScalars: true,
};

const documentsForRole = (role: string): string[] => {
  return role === 'admin'
    ? [
        './src/graphql/generated/*.{graphql,gql}',
        './src/graphql/*.{graphql,gql}',
      ]
    : [
        `./src/graphql/generated/${Case.kebab(role)}-role/*.{graphql,gql}`,
        `./src/graphql/${Case.kebab(role)}-role/*.{graphql,gql}`,
      ];
};

const graphqlRequestConfig = (role: string): Types.ConfiguredOutput => {
  return {
    schema: [schemaConfig(role)],
    documents: documentsForRole(role),
    plugins: [
      ...typescriptPlugins,
      documentPlugin,
      {
        'codegen-graphql-hasura': {
          generatorKind: 'graphql_request',
          hasuraMetadata,
          hasuraKeys,
        },
      },
    ],
    config: {
      documentMode: 'documentNode',
      fetcher: 'graphql-request',
      ...scalarsConfig,
    },
    hooks: {
      beforeOneFileWrite: (_path, content) => {
        return updateGraphqlRequestImports(content);
      },
    },
  };
};

const reactQueryConfig = (role: string): Types.ConfiguredOutput => {
  return {
    schema: [schemaConfig(role)],
    documents: documentsForRole(role),
    plugins: [
      ...typescriptPlugins,
      documentPlugin,
      {
        'codegen-graphql-hasura': {
          generatorKind: 'react_query',
          hasuraMetadata,
          hasuraKeys,
        },
      },
    ],
    config: scalarsConfig,
    hooks: {
      beforeOneFileWrite: (_path, content) => {
        return updateGraphqlReactQueryContent(content);
      },
    },
  };
};

const instrospectionConfig: Types.ConfiguredOutput = {
  plugins: ['introspection'],
  config: { minify: true },
};

const graphqlHasuraConfig = (
  generatorKind: string,
  role: string,
  fragmentPrefix?: string
): Types.ConfiguredOutput => {
  return {
    schema: [schemaConfig(role)],
    plugins: ['codegen-graphql-hasura'],
    config: {
      generatorKind: generatorKind,
      hasuraMetadata,
      hasuraKeys,
      fragmentPrefix,
    },
  };
};

const defaultConfig: CodegenConfig = {
  overwrite: true,
  generates: {
    ['./src/graphql/generated/schema.graphql']: {
      plugins: ['schema-ast'],
    },
    ['./scripts/generated/introspection.json']: instrospectionConfig,
    ['./hasura/generated/simpleSchema.json']: graphqlHasuraConfig(
      'simple_schema_json',
      'admin'
    ),
    ['./hasura/generated/simpleSchema.user.json']: graphqlHasuraConfig(
      'simple_schema_json',
      'user'
    ),
    ['./src/graphql/generated/documents.graphql']: graphqlHasuraConfig(
      'all_documents',
      'admin'
    ),
    ['./src/graphql/generated/user-role/schema.graphql']: {
      schema: [schemaConfig('user')],
      plugins: ['schema-ast'],
    },
    ['./src/graphql/generated/user-role/documents.graphql']:
      graphqlHasuraConfig('all_documents', 'user'),
    ['./src/graphql/generated/public-role/schema.graphql']: {
      schema: [schemaConfig('public')],
      plugins: ['schema-ast'],
    },
    ['./src/graphql/generated/public-role/documents.graphql']:
      graphqlHasuraConfig('all_documents', 'public', 'Public'),
  },
};

const typescriptConfig: CodegenConfig = {
  schema: [schemaConfig()],
  documents: [],
  overwrite: true,
  generates: {
    ['./scripts/generated/admin-api.ts']: graphqlRequestConfig('admin'),
    ['./src/api/generated/user-hooks.ts']: reactQueryConfig('user'),
    ['./src/api/generated/public-hooks.ts']: reactQueryConfig('public'),
  },
};

const graphqlCodegenConfig: IGraphQLConfig = {
  projects: {
    default: {
      schema: [schemaConfig()],
      extensions: {
        codegen: defaultConfig,
      },
    },
    typescript: {
      schema: [schemaConfig()],
      documents: [],
      extensions: {
        codegen: typescriptConfig,
      },
    },
  },
};

export default graphqlCodegenConfig;
