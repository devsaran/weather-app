import {
  AUTOCOMPLETE_ADD_PLACE,
  AUTOCOMPLETE_ADD_PLACES,
  FAVORITES_ADD_PLACE,
  FAVORITES_REMOVE_PLACE,
  HISTORY_ADD_PLACE,
  HISTORY_CLEAR_PLACES,
  HISTORY_REMOVE_PLACE,
  PlacesActions,
  SELECT_CURRENT_PLACE
} from "./places.actions";
import {MapboxFeature} from "../services";
import {Place} from "../models/place.model";

export interface PlacesState {
  autocomplete: MapboxFeature[];
  history: Place[];
  favorites: Place[];
  selected: any;
  loading: boolean;
}

const initialPlacesState: PlacesState = {
  autocomplete: JSON.parse(localStorage.getItem('__autocomplete') || '[]'),
  history: JSON.parse(localStorage.getItem('__history') || '[]'),
  favorites: JSON.parse(localStorage.getItem('__favorites') || '[]'),
  selected: null,
  loading: false,
};

export function placesReducer(state: PlacesState = initialPlacesState, action: PlacesActions): PlacesState {
  switch (action.type) {
    case AUTOCOMPLETE_ADD_PLACE:
      return {
        ...state,
        autocomplete: [...state.autocomplete, action.payload]
      };
    case AUTOCOMPLETE_ADD_PLACES:
      return {
        ...state,
        autocomplete: action.payload
      };
    case HISTORY_ADD_PLACE:
      let isFavorite = state.favorites.some((item: Place) => item.id === action.payload.id);
      let newAddHistoryPlace = new Place({...action.payload, favorite: isFavorite});
      const nextAddHistory = state.history.filter((item: Place) => item.id !== action.payload.id);
      return {
        ...state,
        history: [newAddHistoryPlace, ...nextAddHistory]
      };
    case HISTORY_CLEAR_PLACES:
      return {
        ...state,
        history: []
      };
    case HISTORY_REMOVE_PLACE:
      const nextRemoveHistory = state.history.filter((item: Place) => item.id !== action.payload.id);
      return {
        ...state,
        history: nextRemoveHistory
      };

    case FAVORITES_ADD_PLACE:
      let newFavoriteAddPlace = new Place({...action.payload, favorite: true});

      let nextFavoriteAddPlaces = state.favorites.filter((item: Place) => item.id !== action.payload.id);

      let historyPlaceAddIndex = state.history.indexOf(action.payload);
      let nextAddFavoriteHistory = state.history || [];
      if (historyPlaceAddIndex >= 0) {
        nextAddFavoriteHistory[historyPlaceAddIndex] = newFavoriteAddPlace;
      }

      return {
        ...state,
        favorites: [newFavoriteAddPlace, ...nextFavoriteAddPlaces],
        history: nextAddFavoriteHistory
      };
    case FAVORITES_REMOVE_PLACE:
      let newFavoriteRemovePlace = new Place({...action.payload, favorite: false});
      let newFavoritesRemovePlaces = state.favorites.filter((item: Place) => item.id !== action.payload.id);
      let historyPlaceRemoveIndex = state.history.indexOf(action.payload);
      let nextRemoveFavoriteHistory = state.history;
      nextRemoveFavoriteHistory[historyPlaceRemoveIndex] = newFavoriteRemovePlace;
      return {
        ...state,
        favorites: newFavoritesRemovePlaces,
        history: nextRemoveFavoriteHistory
      };
    case SELECT_CURRENT_PLACE:
      return {
        ...state,
        selected: action.payload
      };
    default:
      return state;
  }
}


export function savePlacesStore(reducer) {
  return function newReducer(state, action) {
    const nextState = reducer(state, action);
    switch (action.type) {
      case AUTOCOMPLETE_ADD_PLACES:
      case AUTOCOMPLETE_ADD_PLACE:
        localStorage.setItem('__autocomplete', JSON.stringify(nextState.places.autocomplete));
        break;
      case HISTORY_ADD_PLACE:
      case HISTORY_REMOVE_PLACE:
      case HISTORY_CLEAR_PLACES:
        localStorage.setItem('__history', JSON.stringify(nextState.places.history));
        break;
      case FAVORITES_ADD_PLACE:
      case FAVORITES_REMOVE_PLACE:
        localStorage.setItem('__history', JSON.stringify(nextState.places.history));
        localStorage.setItem('__favorites', JSON.stringify(nextState.places.favorites));
        break;
    }
    return nextState;
  }
}

