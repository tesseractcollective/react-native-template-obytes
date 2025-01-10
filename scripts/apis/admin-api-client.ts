import { GraphQLClient } from 'graphql-request'
import config from '../config.js'
import { getSdk } from '../generated/admin-api.js'

export function rawClientWithUrlAndSecret(url: string, secret: string): GraphQLClient {
  return new GraphQLClient(url, {
    headers: {
      'x-hasura-admin-secret': secret,
    },
  })
}
export function sdkClientWithUrlAndSecret(url: string, secret: string) {
  return getSdk(rawClientWithUrlAndSecret(url, secret))
}
export function adminClient() {
  return sdkClientWithUrlAndSecret(config.graphqlUrl, config.adminSecret)
}
