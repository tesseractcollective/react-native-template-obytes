const { input, confirm } = require( '@inquirer/prompts' )
const { consola } = require( 'consola' )

const setupQuestions = async ( args ) => {
  const answers = {}
  if ( !args.projectName ) {
    answers.projectName = await input( {
      message: 'Enter the name of your project',
    } )
  } else {
    answers.projectName = args.projectName
  }

  // Ask if they are using the tesseract platform for the backend
  // If they are then use these values: HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
  //  JWT_CLAIMS_KEY = https://hasura.io/jwt/claims
  // If they are not then ask for the values
  const isTesseract = await confirm( {
    message: 'Are you using the tesseract platform for the backend?',
  } )
  if ( isTesseract ) {
    answers.HASURA_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql'
    answers.JWT_CLAIMS_KEY = 'https://hasura.io/jwt/claims'
    // If they are using the tesseract platform then ask for the tenant id
    answers.TENANT_ID = await input( {
      message: 'Enter the TENANT_ID',
    } )
  } else {
    answers.HASURA_GRAPHQL_ENDPOINT = await input( {
      message: 'Enter the HASURA_GRAPHQL_ENDPOINT',
    } )
    answers.JWT_CLAIMS_KEY = await input( {
      message: 'Enter the JWT_CLAIMS_KEY',
    } )
  }

  // confirm that the hasura server is online and ready to connect to
  const hasuraServerIsReady = await confirm( {
    message: 'Is the hasura server online and ready to connect to?',
  } )
  if ( !hasuraServerIsReady ) {
    consola.error( 'Hasura server is not ready to connect to' )
    process.exit( 1 )
  }

  if ( !answers.HASURA_GRAPHQL_ENDPOINT ) {
    consola.error(
      'No HASURA_GRAPHQL_ENDPOINT provided. Update the .env.development file with the correct HASURA_GRAPHQL_ENDPOINT'
    )
    process.exit( 1 )
  }

  if ( !answers.JWT_CLAIMS_KEY ) {
    consola.error(
      'No JWT_CLAIMS_KEY provided. Update the .env.development file with the correct JWT_CLAIMS_KEY'
    )
    process.exit( 1 )
  }

  if ( isTesseract && !answers.TENANT_ID ) {
    consola.error( 'No TENANT_ID provided. Update the .env.development file with the correct TENANT_ID' )
    process.exit( 1 )
  }

  return answers
}

module.exports = {
  setupQuestions,
}
