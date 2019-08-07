import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {debounceTime, filter, map, tap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState} from "../../../store/app.reducer";
import {Observable, Subscription} from "rxjs";
import {AutocompleteSelectPlace, AutocompleteTyping} from "../../store/places.actions";
import {MapboxFeature} from "../../services";
import {MatAutocompleteSelectedEvent} from "@angular/material";
import {isString} from "util";

@Component({
  selector: 'app-search-place-form',
  templateUrl: './search-place-form.component.html',
  styleUrls: ['./search-place-form.component.scss']
})
export class SearchPlaceFormComponent implements OnInit, OnDestroy {
  myControl = new FormControl();
  inputTypings$: Subscription;
  options$: Observable<MapboxFeature[]>;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit() {
    // Subscribe to Autocomplete input keyup event
    this.inputTypings$ = this.myControl.valueChanges.pipe(
      debounceTime(200),
      filter(value => isString(value) && value !== ''),
      tap(value => this.onTyping(value))
    ).subscribe();

    // Get stream of autocomplete options
    this.options$ = this.store.select('places')
      .pipe(
        map(state => state.autocomplete)
      );
  }

  ngOnDestroy(): void {
    this.inputTypings$.unsubscribe();
  }

  onTyping(value: string) {
    this.store.dispatch(new AutocompleteTyping(value));
  }

  onAutocompleteSelect(event: MatAutocompleteSelectedEvent) {
    this.store.dispatch(new AutocompleteSelectPlace(event.option.value));
  }

  displayOption(value: MapboxFeature) {
    return (value && value.text_pl) || '';
  }
}