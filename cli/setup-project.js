const { execShellCommand, runCommand } = require( './utils.js' )
const { consola } = require( 'consola' )
const fs = require( 'fs-extra' )
const path = require( 'path' )

const initGit = async ( projectName ) => {
  await execShellCommand( `cd ${projectName} && git init && cd ..` )
}

const installDeps = async ( projectName ) => {
  await runCommand( `cd ${projectName} && pnpm install`, {
    loading: 'Installing  project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies, Make sure you have pnpm installed',
  } )
}

const generateGraphql = async ( projectName ) => {
  await runCommand( `cd ${projectName} && pnpm codegen`, {
    loading: 'Generating graphql types',
    success: 'Graphql types generated',
    error: 'Failed to generate graphql types, run `pnpm codegen` manually.',
  } )
}

// remove unnecessary files, such us .git, ios, android, docs, cli, LICENSE
const removeFiles = async ( projectName ) => {
  const FILES_TO_REMOVE = [
    '.git',
    'README.md',
    'ios',
    'android',
    'docs',
    'cli',
    'LICENSE',
  ]

  FILES_TO_REMOVE.forEach( ( file ) => {
    fs.removeSync( path.join( process.cwd(), `${projectName}/${file}` ) )
  } )
}

// Update package.json infos, name and  set version to 0.0.1 + add initial version to osMetadata
const updatePackageInfos = async ( projectName ) => {
  const packageJsonPath = path.join(
    process.cwd(),
    `${projectName}/package.json`
  )
  const packageJson = fs.readJsonSync( packageJsonPath )
  packageJson.osMetadata = { initVersion: packageJson.version }
  packageJson.version = '0.0.1'
  packageJson.name = projectName?.toLowerCase()
  packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/user/repo-name.git',
  }
  fs.writeJsonSync( packageJsonPath, packageJson, { spaces: 2 } )
}

const updateProjectConfig = async ( projectName ) => {
  const configPath = path.join( process.cwd(), `${projectName}/env.js` )
  const contents = fs.readFileSync( configPath, {
    encoding: 'utf-8',
  } )
  const replaced = contents
    .replace( /ObytesApp/gi, projectName )
    .replace( /com.obytes/gi, `com.${projectName.toLowerCase()}` )
    .replace( /obytes/gi, 'expo-owner' )

  fs.writeFileSync( configPath, replaced, { spaces: 2 } )
  const readmeFilePath = path.join(
    process.cwd(),
    `${projectName}/README-project.md`
  )
  fs.renameSync(
    readmeFilePath,
    path.join( process.cwd(), `${projectName}/README.md` )
  )
}

const updateEnvFiles = ( { HASURA_GRAPHQL_ENDPOINT, TENANT_ID, JWT_CLAIMS_KEY } ) => {
  // update .env.development, .env.staging, .env.production with this content
  // HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
  // TENANT_ID=MISSING_TENANT_ID
  // JWT_CLAIMS_KEY=https://hasura.io/jwt/claims

  const envFiles = ['.env.development', '.env.staging', '.env.production']
  envFiles.forEach( envFile => {
    fs.writeFileSync( envFile, `HASURA_GRAPHQL_ENDPOINT=${HASURA_GRAPHQL_ENDPOINT}\nTENANT_ID=${TENANT_ID}\nJWT_CLAIMS_KEY=${JWT_CLAIMS_KEY}` )
  } )
}

const updateHasuraConfig = ( { HASURA_GRAPHQL_ENDPOINT, projectName } ) => {
  const hasuraConfigPath = path.join( process.cwd(), `${projectName}/hasura/config.yaml` )
  const hasuraConfig = fs.readFileSync( hasuraConfigPath, {
    encoding: 'utf-8',
  } )
  const graphqlEndpointRoot = HASURA_GRAPHQL_ENDPOINT.substring( 0, HASURA_GRAPHQL_ENDPOINT.indexOf( '/v1/graphql' ) )
  const replaced = hasuraConfig.replace( /http:\/\/localhost:8080/gi, graphqlEndpointRoot )
  fs.writeFileSync( hasuraConfigPath, replaced, { spaces: 2 } )
}

const createEnvFiles = ( { HASURA_GRAPHQL_ENDPOINT, projectName } ) => {
  const graphqlEndpointRoot = HASURA_GRAPHQL_ENDPOINT.substring( 0, HASURA_GRAPHQL_ENDPOINT.indexOf( '/v1/graphql' ) )
  const cliDefaultEnvContent = `HASURA_GRAPHQL_ENDPOINT=${graphqlEndpointRoot}\nHASURA_GRAPHQL_ADMIN_SECRET=admin-secret\nWORKER_URL=http://localhost:8787\nWORKER_API_KEY=worker-api-key`
  fs.writeFileSync( `${projectName}/hasura/.env`, cliDefaultEnvContent )
  fs.writeFileSync( `${projectName}/scripts/.env`, cliDefaultEnvContent )

  fs.writeFileSync( `${projectName}/.env`, `HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
    HASURA_GRAPHQL_ADMIN_SECRET=admin-secret
JWT_CLAIMS_KEY=https://hasura.io/jwt/claims`)
}

const setupGeneratedFolders = ( projectName ) => {
  fs.mkdirSync( `${projectName}/hasura/generated` )
  fs.mkdirSync( `${projectName}/scripts/generated` )
  fs.mkdirSync( `${projectName}/src/graphql/generated` )
  fs.mkdirSync( `${projectName}/src/api/generated` )
}

const setupProject = async ( args ) => {
  const { projectName, HASURA_GRAPHQL_ENDPOINT, TENANT_ID, JWT_CLAIMS_KEY } = args
  consola.start( `Clean up and setup your project 🧹` )
  try {
    removeFiles( projectName )
    await initGit( projectName )
    updatePackageInfos( projectName )
    updateProjectConfig( projectName )
    updateEnvFiles( args )
    createEnvFiles( args )
    updateHasuraConfig( args )
    setupGeneratedFolders( projectName )
    consola.success( `Clean up and setup your project 🧹` )
  } catch ( error ) {
    consola.error( `Failed to clean up project folder`, error )
    process.exit( 1 )
  }
}

module.exports = {
  setupProject,
  installDeps,
  generateGraphql
}
