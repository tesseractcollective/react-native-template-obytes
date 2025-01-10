import { type EventTrigger, type TableEntry, exportMetadata, replaceMetadata } from '../apis/hasura-metadata-api.js'
import config from '../config.js'

const excludedTables = ['log_audit', 'log', 'history_activity', 'history_notification', 'cache', 'user_session']

function addEventTrigger(table: TableEntry): EventTrigger[] {
  const triggerToRemoveName = `${table.table.name}_all`
  const triggerName = `all_${table.table.name}`
  const eventTrigger: EventTrigger = {
    name: triggerName,
    definition: {
      delete: { columns: '*' },
      enable_manual: false,
      insert: { columns: '*' },
      update: { columns: '*' },
    },
    retry_conf: {
      interval_sec: 10,
      num_retries: 0,
      timeout_sec: 60,
    },
    webhook: '{{WORKER_URL}}/event',
    headers: [{ name: 'x-api-key', value_from_env: 'WORKER_API_KEY' }],
  }
  const eventTriggers = (table.event_triggers ?? []).filter(
    (trigger) => ![triggerName, triggerToRemoveName].includes(trigger.name)
  )
  return [...eventTriggers, eventTrigger]
}

export async function addEventTriggers() {
  const metadata = await exportMetadata(config.metadataConfig)

  metadata.sources.forEach((source) => {
    source.tables.forEach((table) => {
      if (!excludedTables.includes(table.table.name)) {
        table.event_triggers = addEventTrigger(table)
      }
    })
  })

  await replaceMetadata(config.metadataConfig, metadata)
}
