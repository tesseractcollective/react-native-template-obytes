import dotenv from 'dotenv'
dotenv.config()

const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET as string

export default {
  graphqlUrl: process.env.HASURA_GRAPHQL_ENDPOINT + '/v1/graphql',
  adminSecret: adminSecret,

  // scripts only
  metadataConfig: {
    url: process.env.HASURA_GRAPHQL_ENDPOINT + '/v1/metadata',
    headers: {
      ['x-hasura-admin-secret']: adminSecret,
    },
  },
  queryApiConfig: {
    url: process.env.HASURA_GRAPHQL_ENDPOINT + '/v2/query',
    headers: {
      ['x-hasura-admin-secret']: adminSecret,
    },
  },
}
