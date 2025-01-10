import type { HasuraMetadataV3 } from '../../src/types/hasura-metadata-types.js';

export * from '../../src/types/hasura-metadata-types.js';

export interface HasuraApiConfig {
  url: string;
  headers: Record<string, string>;
}

export interface MetadadataRequestParams {
  url: string;
  headers: Record<string, string>;
  type: 'export_metadata' | 'replace_metadata';
  args: Record<string, any>;
}

export const runMetadataRequest = async <T>(
  params: MetadadataRequestParams
) => {
  const response = await fetch(params.url, {
    method: 'POST',
    headers: params.headers,
    body: JSON.stringify({ type: params.type, args: params.args }),
  });
  return (await response.json()) as T;
};

export const exportMetadata = async (
  metadataConfig: HasuraApiConfig
): Promise<HasuraMetadataV3> => {
  const data = await runMetadataRequest<HasuraMetadataV3>({
    ...metadataConfig,
    type: 'export_metadata',
    args: {},
  });
  return data;
};

export const replaceMetadata = async (
  metadataConfig: HasuraApiConfig,
  metadata: HasuraMetadataV3,
  allowInconsistentMetadata = true
) =>
  runMetadataRequest({
    ...metadataConfig,
    type: 'replace_metadata',
    args: {
      allow_inconsistent_metadata: allowInconsistentMetadata,
      metadata,
    },
  });
