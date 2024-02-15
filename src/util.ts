import * as core from '@actions/core'
import { promises as fs } from 'fs'
import * as b64 from 'js-base64'
import { match, P } from 'ts-pattern'

/**
 * All input types of the action.
 */
type Input = {
  'wg-client': string | undefined
  'wg-client-b64': string | undefined
  'log-save-as': string | undefined
  'log-filepath': string
  'timeout-address': string
  'timeout-seconds': number
}

/** Returns a parsed (If needed) value of the types with the correct type */
export function getInput<K extends keyof Input>(name: K): Input[K] {
  // Use the `name` parameter directly to fetch the corresponding input
  return match<keyof Input>(name)
    .with(
      P.union('wg-client', 'wg-client-b64', 'log-save-as'),
      n => core.getInput(n) || (undefined as Input[typeof n])
    )
    .with(
      'log-filepath',
      n => core.getInput(n) || ('/tmp/wg.log' as Input[typeof n])
    )
    .with('timeout-address', n => core.getInput(n, { required: true }))
    .with('timeout-seconds', n => parseInt(core.getInput(n) || '180'))
    .exhaustive() as Input[K]
}

export function errorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown Error'
}

/**
 * Returns the path to the WireGuard client file (created too if base64).
 * Returning an error if inputs are invalid (or file can't be created).
 * @returns {string} The path to the WireGuard client file.
 */
export async function getClientPath(): Promise<string> {
  let client = getInput('wg-client')
  if (client) {
    return client
  }

  const encodedClient = getInput('wg-client-b64')
  console.log('encodedClient:', encodedClient)
  if (encodedClient) {
    const path = '/tmp'
    const filepath = `${path}/wg.conf`
    const decoded = b64.decode(encodedClient)

    try {
      await fs.mkdir(path, { recursive: true })
      await fs.writeFile(filepath, decoded, { flag: 'w+', encoding: 'utf8' })
    } catch (error) {
      const msg = errorToMessage(error)

      throw new Error(
        `Error during write for WireGuard client from Base64: ${msg}`
      )
    }

    return filepath
  }

  throw new Error(
    "No clients were given, must specify either `wg-client` or `wg-client-b64` in action's inputs"
  )
}
