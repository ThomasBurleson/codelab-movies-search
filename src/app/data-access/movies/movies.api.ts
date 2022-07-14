import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { Pagination, MovieItem, MovieGenre } from './movies.model';

// Formatted response for business layers
export interface PaginatedMovieResponse {
  list: MovieItem[];
  pagination: Pagination;
}

// Response from remote endpoint
export interface RemoteMovieResponse {
  page: number;
  results: MovieItem[];
  total_pages: number;
  total_results: number;
}

const HEADERS_MOVIEDB = {
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzUwN2ZiYmVkN2JkMjBiZTg3MTNjMTAyMTdiNDRlNCIsInN1YiI6IjYyY2YyNzhjNmRjNTA3MDA1NDY3ZGM3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gNrKzUpRaTHGeiKBTW_rAfq-HMy21rmxJiCBvrBllfY',
  'Content-Type': 'application/json;charset=utf-8',
};

/** A trivial data layer service that requests movies from a movie database API */
@Injectable()
export class MoviesDataService {
  constructor(private httpClient: HttpClient) {}

  searchByAuthor(term: string, date: string, author: string) {
    term = `${term}&date=${date}&author=${author}`;
    return this.searchMovies(term, 1);
  }

  searchMovies(query: string, page: number): Observable<PaginatedMovieResponse> {
    const params = { params: { query, page }, headers: HEADERS_MOVIEDB };
    const request$ = this.httpClient.get<RemoteMovieResponse>('https://api.themoviedb.org/4/search/movie', params);

    return request$.pipe(map(buildResponseFor(page))); // return 'results' + pagination information
  }

  /**
   * List of all movie Genres
   * @returns
   */
  loadGenres(): Observable<MovieGenre[]> {
    const params = { headers: HEADERS_MOVIEDB };
    const request$ = this.httpClient.get<RemoteMovieResponse>('https://api.themoviedb.org/4/genre/movie/list', params);

    return request$.pipe(map((response) => response['genres']));
  }
}

/**
 * Extract list + pagination info from server response
 */
export function buildResponseFor(page = 1) {
  return function buildPaginatedResponses(data: RemoteMovieResponse): PaginatedMovieResponse {
    const pagination: Pagination = {
      currentPage: page,
      total: data.total_results,
      lastPage: data.total_pages,
      perPage: data.results.length,
    };
    return {
      pagination,
      list: data['results'],
    };
  };
}