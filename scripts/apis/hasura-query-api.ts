import type { HasuraApiConfig } from './hasura-metadata-api.js'

export type TableKey = ForeignKey | PrimaryKey
export interface ForeignKey {
  kind: 'foreign'
  table: string
  columns: string[]
  referenceTable: string
  referenceColumns: string[]
}

export interface PrimaryKey {
  kind: 'primary'
  table: string
  columns: string[]
}

export interface QueryApiRequestParams {
  url: string
  headers: Record<string, string>
  type: 'run_sql'
  args: Record<string, any>
}

export const runSqlRequest = async <T>(params: QueryApiRequestParams) => {
  const response = await fetch(params.url, {
    method: 'POST',
    headers: params.headers,
    body: JSON.stringify({ type: params.type, args: params.args }),
  })
  return (await response.json()) as T
}

export async function getForeignKeys(params: HasuraApiConfig): Promise<ForeignKey[]> {
  const sqlQuery = `SELECT conrelid::regclass AS "tableName", 
          conname AS "foreignKey", 
          pg_get_constraintdef(oid) 
    FROM   pg_constraint 
    WHERE  contype = 'f' 
    AND    connamespace = 'public'::regnamespace   
    ORDER  BY conrelid::regclass::text, contype DESC;`

  const result = await runSqlRequest({
    ...params,
    type: 'run_sql',
    args: {
      source: 'default',
      sql: sqlQuery,
    },
  })

  const regex = /FOREIGN KEY \((.*)\) REFERENCES (.*)\((.*)\)/

  const [_columnNames, ...columnValues] = (result as any).result
  return columnValues.map((item: any[]) => {
    const constraint = item[2]
    const regexResult = regex.exec(constraint)

    const stripQuotes = (value?: string): string => {
      return value?.replace(/"/g, '') ?? ''
    }

    const reference: ForeignKey = {
      kind: 'foreign',
      table: stripQuotes(item[0]),
      columns: stripQuotes(regexResult?.[1]).split(', '),
      referenceTable: stripQuotes(regexResult?.[2]),
      referenceColumns: stripQuotes(regexResult?.[3]).split(', '),
    }

    return reference
  })
}

export async function getPrimaryKeys(params: HasuraApiConfig): Promise<PrimaryKey[]> {
  const sqlQuery = `SELECT conrelid::regclass AS "tableName", 
          conname AS "primaryKey", 
          pg_get_constraintdef(oid) 
    FROM   pg_constraint 
    WHERE  contype = 'p' 
    AND    connamespace = 'public'::regnamespace   
    ORDER  BY conrelid::regclass::text, contype DESC;`

  const result = await runSqlRequest({
    ...params,
    type: 'run_sql',
    args: {
      source: 'default',
      sql: sqlQuery,
    },
  })

  const regex = /PRIMARY KEY \((.*)\)/

  const [_columnNames, ...columnValues] = (result as any).result
  return columnValues.map((item: any[]) => {
    const constraint = item[2]
    const regexResult = regex.exec(constraint)

    const stripQuotes = (value?: string): string => {
      return value?.replace(/"/g, '') ?? ''
    }

    const key: PrimaryKey = {
      kind: 'primary',
      table: stripQuotes(item[0]),
      columns: stripQuotes(regexResult?.[1]).split(', '),
    }

    return key
  })
}

export async function getKeys(params: HasuraApiConfig): Promise<TableKey[]> {
  const primaryKeys = await getPrimaryKeys(params)
  const foreignKeys = await getForeignKeys(params)
  return [...primaryKeys, ...foreignKeys]
}
