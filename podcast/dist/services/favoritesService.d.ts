export declare class FavoritesService {
    private apiUrl;
    constructor();
    private makeRequest;
    getFavorites(): Promise<number[]>;
    addToFavorites(trackId: number | string): Promise<void>;
    removeFromFavorites(trackId: number): Promise<void>;
    toggleFavorite(trackId: number): Promise<boolean>;
    test(): string;
}
//# sourceMappingURL=favoritesService.d.ts.map