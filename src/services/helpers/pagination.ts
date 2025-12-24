export type PaginationMeta = {
  total: number
  page: number
  limit: number
}

export function parseListResponse<T>(
  body: any,
  fallbackPage: number,
  fallbackLimit: number
): { items: T[]; meta: PaginationMeta } {
  const rawItems =
    Array.isArray(body) ? body :
    Array.isArray(body?.data) ? body.data :
    Array.isArray(body?.items) ? body.items :
    Array.isArray(body?.result?.data) ? body.result.data :
    []

  const items: T[] = rawItems

  const meta: PaginationMeta = {
    total: body?.meta?.total ?? body?.total ?? items.length,
    page: body?.meta?.page ?? body?.page ?? fallbackPage,
    limit: body?.meta?.limit ?? body?.limit ?? fallbackLimit,
  }

  return { items, meta }
}
