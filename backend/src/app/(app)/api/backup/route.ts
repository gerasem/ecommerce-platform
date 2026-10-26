import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { spawn } from 'child_process'
import { Readable } from 'stream'

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Authentication check: Ensure the user is an admin
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || !user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUri = process.env.DATABASE_URI
    if (!dbUri) {
      return NextResponse.json({ error: 'DATABASE_URI not found' }, { status: 500 })
    }

    // Spawn the pg_dump process
    // We use `--clean` and `--if-exists` to make the dump easy to restore
    // We use `--no-owner` to avoid permission issues when restoring
    const pgDump = spawn('pg_dump', [dbUri, '--clean', '--if-exists', '--no-owner', '--no-acl'])

    // Handle any errors from the process
    pgDump.on('error', err => {
      console.error('Failed to start pg_dump process:', err)
    })

    pgDump.stderr.on('data', data => {
      console.error(`pg_dump stderr: ${data}`)
    })

    // Create a Readable stream from the stdout of pg_dump
    const readable = new ReadableStream({
      start(controller) {
        pgDump.stdout.on('data', chunk => {
          controller.enqueue(chunk)
        })

        pgDump.stdout.on('end', () => {
          controller.close()
        })

        pgDump.on('error', err => {
          controller.error(err)
        })
      },
      cancel() {
        pgDump.kill()
      }
    })

    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `database-backup-${dateStr}.sql`

    // Return the response as a downloadable file stream
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error: any) {
    console.error('Backup endpoint error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
