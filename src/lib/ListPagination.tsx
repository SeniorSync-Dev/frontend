import { Pagination } from '@heroui/react'

export const PAGE_SIZE = 8

export function pageCountOf(itemCount: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(itemCount / pageSize))
}

export function pageSlice<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  return items.slice((page - 1) * pageSize, page * pageSize)
}

export function ListPagination({
  page,
  itemCount,
  label,
  pageSize = PAGE_SIZE,
  size = 'sm',
  onPageChange,
}: {
  page: number
  itemCount: number
  label: string
  pageSize?: number
  size?: 'sm' | 'md' | 'lg'
  onPageChange: (page: number) => void
}) {
  const pageCount = pageCountOf(itemCount, pageSize)
  if (pageCount === 1) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, itemCount)

  return (
    <Pagination size={size}>
      <Pagination.Summary>
        Viser {first}-{last} af {itemCount} {label}
      </Pagination.Summary>

      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            aria-label="Forrige side"
            isDisabled={page === 1}
            onPress={() => onPageChange(page - 1)}
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>

        {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
          <Pagination.Item key={number}>
            <Pagination.Link
              aria-label={`Side ${number}`}
              isActive={number === page}
              onPress={() => onPageChange(number)}
            >
              {number}
            </Pagination.Link>
          </Pagination.Item>
        ))}

        <Pagination.Item>
          <Pagination.Next
            aria-label="Næste side"
            isDisabled={page === pageCount}
            onPress={() => onPageChange(page + 1)}
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  )
}
