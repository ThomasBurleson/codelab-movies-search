import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { createStore, withProps } from '@ngneat/elf';
import {
  selectAllEntities,
  withEntities,
  setEntities,
} from '@ngneat/elf-entities';

import {
  initState,
  MovieState,
  MovieItem,
  MovieComputedState,
} from './movies.model';
import { computeFilteredMovies } from './movies.filters';

const _store = createStore(
  { name: 'movie' },
  withProps<MovieState>(initState()),
  withEntities<MovieItem>()
);

const movies$ = _store.pipe(selectAllEntities());

const state$ = _store.pipe(
  withLatestFrom(movies$),
  map(([state, allMovies]) => {
    return {
      ...state,
      allMovies,
      filteredMovies: computeFilteredMovies(allMovies, state.filterBy),
    };
  })
);

function updateMovies(movies: MovieItem[], searchBy?: string) {
  const hasSearchBy = searchBy !== undefined && searchBy !== null;
  const updateSearchBy = (state) => ({
    ...state,
    searchBy: hasSearchBy ? searchBy : state.searchBy,
  });

  _store.update(updateSearchBy, setEntities(movies));
}

function updateFilter(filterBy?: string) {
  _store.update((state) => ({
    ...state,
    filterBy: filterBy || '',
  }));
}

function searchBy() {
  return _store.getValue().searchBy;
}

/**********************************************
 * Export special MovieStore API
 **********************************************/

export interface MovieStore {
  state$: Observable<MovieState & MovieComputedState>;
  searchBy: () => string;
  updateMovies: (movies: MovieItem[], searchBy?: string) => void;
  updateFilter: (filterBy?: string) => void;
}

export const store: MovieStore = {
  state$,
  searchBy,
  updateMovies,
  updateFilter,
};
