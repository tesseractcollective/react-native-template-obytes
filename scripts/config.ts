import dotenv from 'dotenv';
dotenv.config();

const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET as string;

// if we dont have a hasura endpoint throw an error
if (!process.env.HASURA_GRAPHQL_ENDPOINT) {
  throw new Error('HASURA_GRAPHQL_ENDPOINT is not set');
}

// get the root of the hasura endpoint
const graphqlUrlRoot = process.env.HASURA_GRAPHQL_ENDPOINT.endsWith(
  '/v1/graphql'
)
  ? process.env.HASURA_GRAPHQL_ENDPOINT.substring(
      0,
      process.env.HASURA_GRAPHQL_ENDPOINT.indexOf('/v1/graphql')
    )
  : process.env.HASURA_GRAPHQL_ENDPOINT;

export default {
  graphqlUrl: graphqlUrlRoot + '/v1/graphql',
  adminSecret: adminSecret,

  // scripts only
  metadataConfig: {
    url: graphqlUrlRoot + '/v1/metadata',
    headers: {
      ['x-hasura-admin-secret']: adminSecret,
    },
  },
  queryApiConfig: {
    url: graphqlUrlRoot + '/v2/query',
    headers: {
      ['x-hasura-admin-secret']: adminSecret,
    },
  },
};
