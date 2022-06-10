import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MoviesDataService } from './movies.data-service';
import {
  MovieItem,
  MovieState,
  MovieComputedState,
  MovieViewModel, MovieRequestStatus,
} from './movies.model';
import { store } from './movies.store';

/**
 * Load movies and cache results for similar future calls.j
 * Architecture:
 *
 */

@Injectable()
export class MoviesFacade {
  public vm$: Observable<MovieViewModel>;

  constructor(private movieAPI: MoviesDataService) {
    this.vm$ = store.state$.pipe(map((state) => this.addViewModelAPI(state)));

    // Load initial movies based on default state values OR [pending] router params
    this.loadMovies(store.searchBy());
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   */
  loadMovies(searchBy: string, page = 1): Observable<MovieViewModel> {
    const onLoaded = {
      next: (list: MovieItem[]) => store.updateMovies(list, searchBy),
    };

    const request$ = this.movieAPI.searchMovies<MovieItem[]>(searchBy, page).pipe(store.trackRequest);

    request$.subscribe(onLoaded);

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string): Observable<MovieViewModel> {
    store.updateFilter(filterBy);
    return this.vm$;
  }

  // *******************************************************
  // Private Methods
  // *******************************************************

  private addViewModelAPI(
    state: MovieState & MovieComputedState & MovieRequestStatus ): MovieViewModel {
    const api = {
      loadMovies: (searchBy: string) => this.loadMovies(searchBy),
      updateFilter: (filterBy: string) => this.updateFilter(filterBy),
      clearFilter: () => this.updateFilter(''),
    };

    return {
      ...state,
      ...api,
    };
  }
}
