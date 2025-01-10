import { exportMetadata, type TableEntry } from '../apis/hasura-metadata-api.js'
import config from '../config.js'

function migrationForTable(table: TableEntry): string {
  const tableName = table.table.name
  const triggerName = `set_public_${tableName}_updated_at`
  return `CREATE TRIGGER ${triggerName} BEFORE UPDATE ON public.${tableName} FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER ${triggerName} ON public.${tableName} IS 'trigger to set value of column "updated_at" to current timestamp on row update';`
}

export async function generateUpdatedAtTriggersSqlMigration(): Promise<string> {
  const metadata = await exportMetadata(config.metadataConfig)
  const migrations: string[] = []

  metadata.sources.forEach((source) => {
    source.tables.forEach((table) => {
      if (table.table.schema !== 'public') {
        return
      }
      migrations.push(migrationForTable(table))
    })
  })

  return migrations.join('\n\n')
}
