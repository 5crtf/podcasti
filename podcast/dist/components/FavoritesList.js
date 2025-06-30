import { toMinAndSec } from '../utils.js';
import { config } from '../config.js';
export class FavoritesList {
    constructor(favoritesService, tracks) {
        this.favoritesService = favoritesService;
        this.tracks = tracks;
        this.favoritesList = document.getElementById('favoritesList');
        this.attachEventListeners();
    }
    async loadFavorites() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiUrl}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const favoriteTracks = await response.json();
        favoriteTracks.forEach(track => {
            if (track.duration && track.duration < 20) {
                track.duration = track.duration * 60;
            }
            // Формируем audio_url, если есть encoded_audio
            if (track.encoded_audio && !track.audio_url) {
                track.audio_url = `data:audio/mp3;base64,${track.encoded_audio}`;
            }
        });
        // Синхронизируем избранные с app.ts
        window.app?.setFavorites?.(favoriteTracks);
        this.renderFavorites(favoriteTracks);
    }
    // Обновляем список треков
    updateTracks(tracks) {
        this.tracks = tracks;
        this.loadFavorites();
    }
    renderFavorites(favorites) {
        if (!this.favoritesList) {
            throw new Error('Элемент favoritesList не найден при рендеринге');
        }
        if (favorites.length === 0) {
            this.favoritesList.innerHTML = '<div class="no-favorites">Нет избранных треков</div>';
            return;
        }
        this.favoritesList.innerHTML = `
            <div class="tracks-header">
                <div class="header-item no">№</div>
                <div class="header-item title">НАЗВАНИЕ</div>
                <div class="header-item album">АЛЬБОМ</div>
                <div class="header-item date">
                    <svg width="16" height="16" aria-hidden="true">
                        <use xlink:href="svg/CalendarBlank.svg"></use>
                    </svg>
                </div>
                <div class="header-item duration">
                    <svg width="16" height="16" aria-hidden="true">
                        <use xlink:href="svg/Clock.svg"></use>
                    </svg>
                </div>
            </div>
            <div class="tracks-list">
            ${favorites.map((track, index) => `
                <div class="track-row" data-id="${track.id}">
                    <div class="track-item no">${index + 1}</div>
                    <div class="track-item title">
                        <img class="track-cover" src="${track.cover_url || 'image/default-cover.svg'}" alt="cover"/>
                        <div class="track-meta">
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                    </div>
                    <div class="track-item album">${track.album || '-'}</div>
                    <div class="track-item date">${track.dateAdded || ''}</div>
                    <button class="track-fav active" title="В избранное">❤</button>
                    <div class="track-item duration">${track.duration ? toMinAndSec(track.duration) : '0:00'}</div>
                    <div class="track-item options">
                        <span class="more-options">...</span>
                    </div>
                </div>
            `).join('')}
            </div>
        `;
        // Добавляем обработчики для клика по строке трека
        this.favoritesList.querySelectorAll('.track-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.track-fav') || e.target.closest('.more-options')) {
                    return;
                }
                const trackId = Number(row.dataset.id);
                if (trackId) {
                    const track = favorites.find(t => t.id === trackId);
                    if (track) {
                        window.app.playTrack(track);
                    }
                }
            });
        });
        // Добавляем обработчики для кнопки избранного
        this.favoritesList.querySelectorAll('.track-fav').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const trackId = Number(e.currentTarget.closest('.track-row').dataset.id);
                if (trackId) {
                    try {
                        await this.favoritesService.removeFromFavorites(trackId);
                        await this.loadFavorites();
                    }
                    catch (error) {
                        this.showMessage('Ошибка при удалении из избранного', true);
                    }
                }
            });
        });
    }
    attachEventListeners() {
        if (!this.favoritesList)
            return;
        this.favoritesList.addEventListener('click', (e) => {
            const trackRow = e.target.closest('.track-row');
            if (!trackRow)
                return;
            const trackId = trackRow.dataset.trackId;
            if (!trackId)
                return;
            // Предотвращаем срабатывание клика по строке, если клик был по кнопке избранного или опций
            if (e.target.closest('.track-fav')) {
                const favButton = e.target.closest('.track-fav');
                if (favButton) {
                    favButton.classList.toggle('active');
                    // Создаем событие для обновления избранного
                    const event = new CustomEvent('toggleFavorite', {
                        detail: { trackId }
                    });
                    window.dispatchEvent(event);
                }
                return;
            }
            if (e.target.closest('.more-options')) {
                return;
            }
            // Воспроизведение трека при клике на строку
            const event = new CustomEvent('playTrack', {
                detail: { trackId }
            });
            window.dispatchEvent(event);
        });
    }
    async removeFromFavorites(trackId) {
        await this.favoritesService.removeFromFavorites(trackId);
        await this.loadFavorites();
    }
    showMessage(message, isError = false) {
        if (!this.favoritesList) {
            throw new Error('Элемент favoritesList не найден при показе сообщения');
        }
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isError ? 'error' : 'info'}`;
        messageElement.textContent = message;
        this.favoritesList.appendChild(messageElement);
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    test() {
        return 'ok';
    }
}
//# sourceMappingURL=FavoritesList.js.map