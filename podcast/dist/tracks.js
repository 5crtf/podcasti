import { toMinAndSec } from './utils.js';
export async function loadTracks(API_URL, state, elements, favoritesListInstance, renderTracks) {
    try {
        console.log('Начало загрузки треков...');
        const response = await fetch(`${API_URL}/tracks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tracks = await response.json();
        console.log('Получены треки с сервера:', tracks);
        // Преобразуем длительность из формата 'minutes.seconds' в секунды
        const processedTracks = tracks.map(track => {
            console.log('Обработка трека:', track);
            return {
                ...track,
                audio_url: `data:audio/mp3;base64,${track.encoded_audio}`,
                duration: track.duration ? parseFloat(track.duration.toString()) * 60 : 0,
                isFavorite: false
            };
        });
        console.log('Обработанные треки:', processedTracks);
        state.audios = processedTracks;
        renderTracks(processedTracks, state, elements, favoritesListInstance);
        favoritesListInstance.updateTracks(processedTracks);
    }
    catch (error) {
        console.error('Ошибка при загрузке треков:', error);
        alert('Ошибка при загрузке треков');
    }
}
export function renderTracks(tracks, state, elements, favoritesListInstance) {
    elements.tracksList.innerHTML = `
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
        ${tracks.map((track, index) => `
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
                <button class="track-fav${track.isFavorite ? ' active' : ''}" title="В избранное">❤</button>
                <div class="track-item duration">${track.duration ? toMinAndSec(track.duration) : '0:00'}</div>
                <div class="track-item options">
                    <span class="more-options">...</span>
                </div>
            </div>
        `).join('')}
        </div>
    `;
    // Добавляем обработчики для клика по строке трека
    elements.tracksList.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', (e) => {
            // Предотвращаем срабатывание клика по строке, если клик был по кнопке избранного или опций
            if (e.target.closest('.track-fav') || e.target.closest('.more-options')) {
                return;
            }
            const trackId = Number(row.dataset.id);
            if (trackId) {
                const track = state.audios.find(t => t.id === trackId);
                if (track) {
                    // Вызов playTrack должен быть реализован через player.ts или window.app
                    window.app.playTrack(track);
                }
            }
        });
    });
    // Добавляем обработчики для кнопки избранного
    elements.tracksList.querySelectorAll('.track-fav').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Останавливаем всплытие события, чтобы не срабатывал клик по строке
            const trackId = Number(e.currentTarget.closest('.track-row').dataset.id);
            if (trackId) {
                // Вызов toggleFavorite должен быть реализован через window.app или отдельную функцию
                if (window.app && typeof window.app.toggleFavorite === 'function') {
                    window.app.toggleFavorite(trackId);
                }
            }
        });
    });
}
//# sourceMappingURL=tracks.js.map