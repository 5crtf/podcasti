import { Track } from '../types.js';
import { FavoritesService } from '../services/favoritesService';
export declare class FavoritesList {
    private favoritesService;
    private favoritesList;
    private tracks;
    constructor(favoritesService: FavoritesService, tracks: Track[]);
    loadFavorites(): Promise<void>;
    updateTracks(tracks: Track[]): void;
    private renderFavorites;
    private attachEventListeners;
    removeFromFavorites(trackId: number): Promise<void>;
    private showMessage;
    test(): string;
}
//# sourceMappingURL=FavoritesList.d.ts.map