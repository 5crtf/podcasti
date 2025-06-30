import { AppElements, Track } from '../types.js';
import { FavoritesList } from '../components/FavoritesList.js';

export function showSection(section: string, elements: AppElements, favoritesListInstance: FavoritesList): void {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById(`${section}Section`)?.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');

    // Загружаем избранное, если переключились на раздел избранного
    if (section === 'favorites') {
        favoritesListInstance.loadFavorites();
    }
}

export function showMessage(message: string, isError: boolean = false): void {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isError ? 'error' : 'info'}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

export function updatePlayerUI(currentTrack: Track | null, updatePlayerInfo: (track: Track) => void, updatePlayButton: () => void): void {
    if (currentTrack) {
        updatePlayerInfo(currentTrack);
        updatePlayButton();
    }
} 