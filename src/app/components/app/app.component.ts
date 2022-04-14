import { Component, TrackByFunction } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  computeFilteredMovies,
  MovieItem,
  MovieState,
  MoviesDataService,
} from '../../data-access';

const findMovieId: TrackByFunction<MovieItem> = (i: number, m: MovieItem) =>
  m.poster_path;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  trackByKey = findMovieId;
  allMovies: MovieItem[];
  filteredMovies: MovieItem[];

  form = this.fb.group({
    searchBy: new FormControl(''),
    filterBy: new FormControl(''),
  });

  constructor(private fb: FormBuilder, private api: MoviesDataService) {}

  ngOnInit() {
    const filterByCtrl = this.form.controls['filterBy'];

    // When 'filterBy' input value changes, auto request filter update
    filterByCtrl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v) => {
        this.filterMovies(v);
      });
  }

  loadMovies() {
    const searchForCtrl = this.form.controls['searchBy'];

    this.api
      .searchMovies(searchForCtrl.value, 1)
      .subscribe((allMovies: MovieItem[]) => {
        const filterByCtrl = this.form.controls['filterBy'];

        this.allMovies = allMovies;
        this.filterMovies(filterByCtrl.value);
      });
  }

  filterMovies(filterBy: string) {
    const state = {
      allMovies: this.allMovies,
      filterBy,
    } as MovieState;
    this.filteredMovies = computeFilteredMovies(state);
  }

  clearOnEscape(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      const filterBy = this.form.controls['filterBy'];
      filterBy.setValue('');
    }
  }
}
