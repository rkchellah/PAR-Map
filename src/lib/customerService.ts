import { supabase } from './supabase'
import type { Customer } from '../types/par'

export async function syncCustomers(rows: Record<string, unknown>[]) {
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`)

  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const { error } = await supabase.from('customers').insert(rows.slice(i, i + chunkSize))
    if (error) throw new Error(`Insert failed at row ${i}: ${error.message}`)
  }

  return { success: true }
}

export async function getCustomers(): Promise<Customer[]> {
  const PAGE = 1000
  const all: Customer[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(from, from + PAGE - 1)

    if (error) throw error

    all.push(...(data ?? []))

    if ((data?.length ?? 0) < PAGE) break
    from += PAGE
  }

  return all
}