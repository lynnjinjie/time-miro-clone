import EmptyBoards from './empty-boards'
import EmptyFavorites from './empty-favorites'
import EmptySearch from './empty.search'

interface BoardListProps {
  orgId: string
  query: {
    search?: string
    favorites?: string
  }
}

export default function BoardList({ orgId, query }: BoardListProps) {
  const data = [] // TODO

  if (!data.length && query.search) {
    return <EmptySearch />
  }
  if (!data.length && query.favorites) {
    return <EmptyFavorites />
  }
  if (!data.length) {
    return <EmptyBoards />
  }
  return <div>{JSON.stringify(query)}</div>
}
