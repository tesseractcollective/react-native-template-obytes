require( 'dotenv' ).config()

module.exports = {
  cacheSchemaFileForLookup: false,
  schema: {
    [`${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`]: {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET + "",
      },
    },
  },
  documents: [
    './src/**/*.graphql',
    './src/**/*.gql',
  ]
}
