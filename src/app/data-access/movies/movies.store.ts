import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { createStore, setProp, setProps, withProps } from '@ngneat/elf';
import {
  selectAllEntities,
  withEntities,
  setEntities,
} from '@ngneat/elf-entities';

import {
  initState,
  MovieState,
  MovieItem,
  MovieComputedState, MovieRequestStatus,
} from './movies.model';
import { computeFilteredMovies } from './movies.filters';
import {
  selectRequestStatus,
  updateRequestStatus,
  withRequestsStatus,
  createRequestsStatusOperator
} from '@ngneat/elf-requests';
import { initializeAsPending } from '@ngneat/elf-requests';

const _store = createStore(
  { name: 'movie' },
  withProps<MovieState>(initState()),
  withEntities<MovieItem>(),
  withRequestsStatus<'movie'>(initializeAsPending('movie'))
);

const movies$ = _store.pipe(selectAllEntities());
const status$ = _store.pipe(selectRequestStatus('movie'));

const trackRequestsStatus = createRequestsStatusOperator(_store);

const state$ = _store.pipe(
  withLatestFrom(movies$, status$),
  map(([state, allMovies, status]) => {
    return {
      ...state,
      allMovies,
      filteredMovies: computeFilteredMovies(allMovies, state.filterBy),
      status
    };
  })
);

function updateMovies(movies: MovieItem[], searchBy?: string) {
  const hasSearchBy = searchBy !== undefined && searchBy !== null;

  _store.update(
    setProps(state => ({ searchBy: hasSearchBy ? searchBy : state.searchBy })),
    setEntities(movies),
    updateRequestStatus('movie', 'success'),
  );
}

function updateFilter(filterBy?: string) {
  _store.update(setProp('filterBy', filterBy || ''));
}

function searchBy() {
  return _store.getValue().searchBy;
}

/**********************************************
 * Export special MovieStore API
 **********************************************/

export interface MovieStore {
  state$: Observable<MovieState & MovieRequestStatus & MovieComputedState>;
  searchBy: () => string;
  updateMovies: (movies: MovieItem[], searchBy?: string) => void;
  updateFilter: (filterBy?: string) => void;
  trackRequest: MonoTypeOperatorFunction<unknown>;
}

export const store: MovieStore = {
  state$,
  searchBy,
  updateMovies,
  updateFilter,
  trackRequest: trackRequestsStatus('movie')
};
