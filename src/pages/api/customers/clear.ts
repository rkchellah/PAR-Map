import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

const BATCH = 500

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Not authenticated')

  const admin = getSupabaseAdmin()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) throw new Error('Not authenticated')

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') throw new Error('Admin access required')
  return admin
}

async function deleteAllCustomers(admin: ReturnType<typeof getSupabaseAdmin>) {
  let deleted = 0

  for (let i = 0; i < 200; i++) {
    const { data, error } = await admin
      .from('customers')
      .select('id')
      .limit(BATCH)

    if (error) throw new Error(error.message)
    if (!data?.length) return deleted

    const ids = data.map((row) => row.id as string)
    const { error: delErr, count } = await admin
      .from('customers')
      .delete({ count: 'exact' })
      .in('id', ids)
    if (delErr) throw new Error(delErr.message)
    deleted += count ?? ids.length
  }

  throw new Error('Delete stopped after too many batches')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const admin = await requireAdmin(req)
    const deleted = await deleteAllCustomers(admin)
    return res.status(200).json({ ok: true, deleted })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    const status = message === 'Not authenticated' ? 401
      : message === 'Admin access required' ? 403
      : 500
    return res.status(status).json({ error: message })
  }
}
