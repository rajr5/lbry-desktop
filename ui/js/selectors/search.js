import { createSelector } from 'reselect'
import {
  selectCurrentParams,
  selectDaemonReady,
  selectPageTitle,
  selectCurrentPage,
  selectCurrentUri
} from 'selectors/app'

export const _selectState = state => state.search || {}

export const selectSearchQuery = createSelector(
  selectCurrentParams,
  (params) => params.query
)

export const selectIsSearching = createSelector(
  _selectState,
  (state) => !!state.searching
)

export const selectSearchResults = createSelector(
  _selectState,
  (state) => state.results || {}
)

export const selectSearchResultsByQuery = createSelector(
  selectSearchResults,
  (results) => results.byQuery || {}
)

export const selectCurrentSearchResults = createSelector(
  selectSearchQuery,
  selectSearchResultsByQuery,
  (query, byQuery) => byQuery[query]
)


export const selectWunderBarAddress = createSelector(
  selectPageTitle,
  selectSearchQuery,
  (title, query) => query || title
)

export const selectWunderBarIcon = createSelector(
  selectCurrentPage,
  selectCurrentUri,
  (page, uri) => {
    switch (page) {
      case 'search':
        return 'icon-search'
      case 'settings':
        return 'icon-gear'
      case 'help':
        return 'icon-question'
      case 'report':
        return 'icon-file'
      case 'downloaded':
        return 'icon-folder'
      case 'published':
        return 'icon-folder'
      case 'start':
        return 'icon-file'
      case 'rewards':
        return 'icon-bank'
      case 'wallet':
      case 'send':
      case 'receive':
        return 'icon-bank'
      case 'show':
        return 'icon-file'
      case 'publish':
        return 'icon-upload'
      case 'developer':
        return 'icon-file'
      case 'developer':
        return 'icon-code'
      case 'discover':
        return 'icon-home'
    }
  }
)