import { exportMetadata } from './apis/hasura-metadata-api.js';
import { getKeys } from './apis/hasura-query-api.js';
import config from './config.js';
import { generateUpdatedAtTriggersSqlMigration } from './sql-scripts/generate-updated-at-triggers-sql-migration.js';
import { createJwks } from './utils/create-jwks.js';

const scriptName = process.argv[2];

async function runScript(name: string) {
  switch (name) {
    case 'metadata_json':
      const metadata = await exportMetadata(config.metadataConfig);
      return JSON.stringify(metadata, null, 2);
    case 'table_keys_json':
      return JSON.stringify(await getKeys(config.queryApiConfig), null, 2);
    case 'hasura_sql_triggers':
      return generateUpdatedAtTriggersSqlMigration();
    case 'jwks':
      return JSON.stringify(await createJwks());
  }

  console.debug(`No script named ${name}`);
}

(async () => {
  try {
    const output = await runScript(scriptName);
    if (output) {
      console.log(output);
    }
  } catch (error: any) {
    console.error(error?.message ?? error);
  }
  process.exit(0);
})();
