import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './components';
import { HttpClientModule } from '@angular/common/http';

import { MoviesFacade, MoviesDataService } from './data-access';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [MoviesFacade, MoviesDataService],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
