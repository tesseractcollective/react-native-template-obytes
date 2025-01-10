import Case from 'case'
import { buildClientSchema, GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import {
  exportMetadata,
  replaceMetadata,
  type DeletePermissionEntry,
  type InsertPermissionEntry,
  type SelectPermissionEntry,
  type TableEntry,
  type UpdatePermissionEntry,
} from '../apis/hasura-metadata-api.js'
import config from '../config.js'
import introspection from '../generated/introspection.json'

const columns = '*'
const filter = { tenant_id: { _eq: 'X-Hasura-Tenant-Id' } }
const check = { tenant_id: { _eq: 'X-Hasura-Tenant-Id' } }
const set = { tenant_id: 'X-Hasura-Tenant-Id' }

interface AnyPermissionEntry {
  comment?: string
  role: string
  permission: any
}

function updatePermissions<T extends AnyPermissionEntry>(
  originalPermissions: T[] | undefined,
  newPermission: T | undefined,
  removePermissionsForRole?: string
): T[] | undefined {
  if (!newPermission) {
    return originalPermissions
  }
  const permissions = originalPermissions || []
  let isReplaced = false
  const newPermissions = permissions.map((permission) => {
    if (permission.role === newPermission.role) {
      isReplaced = true
      return newPermission
    }
    return permission
  })

  if (!isReplaced) {
    newPermissions.push(newPermission)
  }
  if (removePermissionsForRole) {
    return newPermissions.filter((permission) => permission.role !== removePermissionsForRole)
  }
  return newPermissions
}

export function createTenantAdminSelectPermission(type: GraphQLObjectType): SelectPermissionEntry | undefined {
  const fields = type.getFields()
  if (fields['tenantId']) {
    return {
      role: 'tenant_admin',
      permission: {
        columns,
        filter,
        allow_aggregations: true,
      },
    }
  }
  return undefined
}

export function createTenantAdminInsertPermission(type: GraphQLObjectType): InsertPermissionEntry | undefined {
  const fields = type.getFields()
  if (fields['tenantId']) {
    return {
      role: 'tenant_admin',
      permission: {
        columns,
        check,
        set,
      },
    }
  }
  return undefined
}

export function createTenantAdminUpdatePermission(type: GraphQLObjectType): UpdatePermissionEntry | undefined {
  const fields = type.getFields()
  if (fields['tenantId']) {
    return {
      role: 'tenant_admin',
      permission: {
        columns,
        check,
        filter,
        set,
      },
    }
  }
  return undefined
}

export function createTenantAdminDeletePermission(type: GraphQLObjectType): DeletePermissionEntry | undefined {
  const fields = type.getFields()
  if (fields['tenantId']) {
    return {
      role: 'tenant_admin',
      permission: {
        filter,
      },
    }
  }
  return undefined
}

function addTenantAdminPermissionsToTable(table: TableEntry, schema: GraphQLSchema) {
  const typeName = Case.pascal(table.table.name)
  const type = schema.getType(typeName)
  if (!isObjectType(type)) {
    throw new Error(`invalid type ${type} for ${table.table.name}`)
  }

  table.insert_permissions = updatePermissions(table.insert_permissions, createTenantAdminInsertPermission(type))
  table.select_permissions = updatePermissions(table.select_permissions, createTenantAdminSelectPermission(type))
  table.update_permissions = updatePermissions(table.update_permissions, createTenantAdminUpdatePermission(type))
  table.delete_permissions = updatePermissions(table.delete_permissions, createTenantAdminDeletePermission(type))
}

export async function addTenantAdminPermissions() {
  const schema = buildClientSchema(introspection as any)
  const metadata = await exportMetadata(config.metadataConfig)

  metadata.sources.forEach((source) => {
    source.tables.forEach((table) => {
      addTenantAdminPermissionsToTable(table, schema)
    })
  })

  await replaceMetadata(config.metadataConfig, metadata)
}
