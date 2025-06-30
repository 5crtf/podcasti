import { Track, AppState, AppElements } from './types.js';
import { FavoritesList } from './components/FavoritesList.js';
export declare function loadTracks(API_URL: string, state: AppState, elements: AppElements, favoritesListInstance: FavoritesList, renderTracks: (tracks: Track[], state: AppState, elements: AppElements, favoritesListInstance: FavoritesList) => void): Promise<void>;
export declare function renderTracks(tracks: Track[], state: AppState, elements: AppElements, favoritesListInstance: FavoritesList): void;
//# sourceMappingURL=tracks.d.ts.map