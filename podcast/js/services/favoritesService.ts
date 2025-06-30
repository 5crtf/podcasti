import { config } from '../config.js';
import { Track, ApiResponse } from '../types.js';

// Интерфейс для ответа API избранного
interface FavoritesResponse {
    message: string;
}

// Интерфейс для запроса добавления/удаления из избранного
interface FavoriteRequest {
    trackId: string;
}

export class FavoritesService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = config.apiUrl;
    }

    private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Требуется авторизация');
        }

        const authHeader = `Bearer ${token}`;
        console.log('Auth header:', authHeader);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getFavorites(): Promise<number[]> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            console.log('Getting favorites with token:', token);
            console.log('Request URL:', `${this.apiUrl}/favorites`);
            
            const response = await fetch(`${this.apiUrl}/favorites`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data: number[] = await response.json();
            console.log('Received favorites data:', data);
            
            // Преобразуем все ID в числа
            const favoriteIds = data.map((id: number) => Number(id));
            console.log('Converted favorite IDs:', favoriteIds);
            
            // Сохраняем в localStorage
            localStorage.setItem('favorites', JSON.stringify(favoriteIds));
            console.log('Saved to localStorage:', favoriteIds);
            
            return favoriteIds;
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    }

    async addToFavorites(trackId: number | string): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        
        const url = this.apiUrl + '/favorites';
        const body = JSON.stringify({ trackId: String(trackId) });
        // console.log('POST', url);
        // console.log('Token:', token);
        // console.log('Request body:', body);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body
        });
        
        // console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа сервера:', errorText);
            throw new Error(errorText);
        }
    }

    async removeFromFavorites(trackId: number): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            // console.log('Removing from favorites:', trackId);
            // console.log('Request URL:', `${this.apiUrl}/favorites`);
            const requestBody: FavoriteRequest = { trackId: String(trackId) };
            // console.log('Request body:', requestBody);
            
            const response = await fetch(`${this.apiUrl}/favorites`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            // console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            // Обновляем localStorage после успешного удаления
            const currentFavorites: number[] = JSON.parse(localStorage.getItem('favorites') || '[]');
            const updatedFavorites = currentFavorites.filter((id: number) => id !== trackId);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            // console.log('Updated favorites in localStorage:', updatedFavorites);
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }

    async toggleFavorite(trackId: number): Promise<boolean> {
        try {
            console.log('Toggling favorite for track:', trackId);
            const favorites = await this.getFavorites();
            const isFavorite = favorites.includes(trackId);
            console.log('Current favorites:', favorites);
            console.log('Is favorite:', isFavorite);

            if (isFavorite) {
                await this.removeFromFavorites(trackId);
                return false;
            } else {
                await this.addToFavorites(trackId);
                return true;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    }

    test(): string {
        return 'ok';
    }
}