import * as core from '@actions/core'
import * as ping from 'ping'
import { errorToMessage, getClientPath, getInput } from './util'
import { exec } from '@actions/exec'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Stating WireGuard connection process')
  try {
    const path = getClientPath()

    await exec('sudo wg-quick', ['up', await path])

    const addr = getInput('timeout-address')
    const timeout = getInput('timeout-seconds')
    await pingUntilSuccessful(addr, timeout)
  } catch (error) {
    core.setFailed(errorToMessage(error))
  }
}

/**
 * Tries to connect to the given address and port until successful or until the timeout is reached.
 * @param {string} ip - The IP address to connect to.
 * @param {number} timeoutSeconds - The timeout in seconds.
 * @returns {Promise<ping.PingResponse>} A promise that resolves if the connection is successful within the timeout, and rejects otherwise.
 */
export async function pingUntilSuccessful(
  addr: string,
  timeoutSeconds: number
): Promise<ping.PingResponse> {
  const timeoutMillis = timeoutSeconds * 1000
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMillis) {
    try {
      const res = await ping.promise.probe(addr)
      if (res.alive) {
        console.log(`Connection/Ping to ${addr} confirmed as successful:`, res)
        return res
      }
    } catch (error) {
      console.error(`Connection/Ping to ${addr} failed but retrying:`, error)
    }

    // Wait for a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 250))
  }

  throw new Error(
    `Timeout reached without a successful connection to ${addr} after ${timeoutSeconds} seconds.`
  )
}
