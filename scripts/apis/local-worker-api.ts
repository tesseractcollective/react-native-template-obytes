export const localWorkerUrl = 'http://localhost:8787'
export const localWorkerApiKey = 'worker-api-key'

export interface JobPayload<T extends Record<string, any> = Record<string, any>> {
  comment: string
  id: string
  name: string
  payload: T
  scheduled_time: string
}

export async function triggerJob(job: JobPayload) {
  const url = `${localWorkerUrl}/job`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': localWorkerApiKey,
    },
    body: JSON.stringify(job),
  })
  return response.json()
}

export async function triggerJobSyncEventsTheDuttons() {
  return await triggerJob({
    name: 'jobSyncEventsTheDuttons',
    payload: {},
    scheduled_time: new Date().toISOString(),
    comment: 'Importing events for The Duttons',
    id: '1',
  })
}
