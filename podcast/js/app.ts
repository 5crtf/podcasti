import { Track, AppState, ApiResponse, AppElements } from './types.js';
import { shuffle, toMinAndSec } from './utils.js';
import { FavoritesService } from './services/favoritesService.js';
import { FavoritesList } from './components/FavoritesList.js';

class App {
    private API_URL = 'http://localhost:8000/api';
    private favoritesService: FavoritesService;
    private favoritesListInstance: FavoritesList;
    private state: AppState = {
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.5,
        isMuted: false,
        repeating: false,
        audios: [],
        playerEventListenersInitialized: false
    };
    private audio!: HTMLAudioElement;
    private elements: AppElements;

    constructor() {
        this.favoritesService = new FavoritesService();
        this.favoritesListInstance = new FavoritesList(this.favoritesService, this.state.audios);
        
        this.elements = {
            authContainer: document.getElementById('authContainer') as HTMLDivElement,
            registerContainer: document.getElementById('registerContainer') as HTMLDivElement,
            mainContainer: document.getElementById('mainContainer') as HTMLDivElement,
            loginForm: document.getElementById('loginForm') as HTMLFormElement,
            registerForm: document.getElementById('registerForm') as HTMLFormElement,
            showRegister: document.getElementById('showRegister') as HTMLAnchorElement,
            showLogin: document.getElementById('showLogin') as HTMLAnchorElement,
            tracksList: document.getElementById('tracksList') as HTMLDivElement,
            favoritesList: document.getElementById('favoritesList') as HTMLDivElement,
            favoritesSection: document.getElementById('favoritesSection') as HTMLDivElement,
            tracksSection: document.getElementById('tracksSection') as HTMLDivElement,
            player: document.getElementById('player') as HTMLDivElement,
            playBtn: document.getElementById('playBtn') as HTMLButtonElement,
            prevBtn: document.getElementById('prevBtn') as HTMLButtonElement,
            nextBtn: document.getElementById('nextBtn') as HTMLButtonElement,
            repeatBtn: document.getElementById('repeatBtn') as HTMLButtonElement,
            shuffleBtn: document.getElementById('shuffleBtn') as HTMLButtonElement,
            volumeSlider: document.getElementById('volumeSlider') as HTMLInputElement,
            progress: document.getElementById('progress') as HTMLDivElement,
            currentTime: document.getElementById('currentTime') as HTMLSpanElement,
            duration: document.getElementById('duration') as HTMLSpanElement,
            logoutBtn: document.getElementById('logoutBtn') as HTMLAnchorElement
        };

        this.initializeEventListeners();
        this.initializeKeyboardControls();
        this.checkAuth();
    }

    private initializeKeyboardControls(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.state.currentTrack) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.seekBackward();
                    break;
                case 'ArrowRight':
                    this.seekForward();
                    break;
            }
        });
    }

    private seekForward(): void {
        if (!this.state.currentTrack || !this.audio) return;
        const newTime = Math.min(this.audio.currentTime + 10, this.audio.duration);
        this.audio.currentTime = newTime;
        this.updateProgress();
    }

    private seekBackward(): void {
        if (!this.state.currentTrack || !this.audio) return;
        const newTime = Math.max(this.audio.currentTime - 10, 0);
        this.audio.currentTime = newTime;
        this.updateProgress();
    }

    private initializeEventListeners(): void {
        // Авторизация
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        if (this.elements.showRegister) {
            this.elements.showRegister.addEventListener('click', this.showRegister.bind(this));
        }
        if (this.elements.showLogin) {
            this.elements.showLogin.addEventListener('click', this.showLogin.bind(this));
        }
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Навигация
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = (e.currentTarget as HTMLElement).getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Обработчик события playTrack
        window.addEventListener('playTrack', ((e: CustomEvent<{ trackId: string }>) => {
            const { trackId } = e.detail;
            const track = this.state.audios.find(t => t.id === Number(trackId));
            if (track) {
                this.playTrack(track);
            }
        }) as EventListener);

        // Обработчик события toggleFavorite
        window.addEventListener('toggleFavorite', ((e: CustomEvent<{ trackId: string }>) => {
            const { trackId } = e.detail;
            this.toggleFavorite(Number(trackId));
        }) as EventListener);

        // Добавляем обработчик клика по временной шкале
        this.elements.progress.addEventListener('click', (e: MouseEvent) => {
            if (!this.state.currentTrack || !this.audio) return;
            
            const rect = this.elements.progress.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const newTime = clickPosition * this.audio.duration;
            
            this.audio.currentTime = newTime;
            this.updateProgress();
        });

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e: MouseEvent) => {
                if (!this.state.currentTrack || !this.audio) return;
                const rect = progressBar.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                const newTime = clickPosition * this.audio.duration;
                this.audio.currentTime = newTime;
                this.updateProgress();
            });
        }
    }

    private initPlayerEventListeners(): void {
        console.log('initPlayerEventListeners вызван');
        console.log('this.audio в initPlayerEventListeners:', this.audio);
        // Добавляем обработчики событий плеера только если элементы существуют
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', this.handlePlay.bind(this));
        }
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', this.handlePrev.bind(this));
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', this.handleNext.bind(this));
        }
        if (this.elements.repeatBtn) {
            this.elements.repeatBtn.addEventListener('click', this.handleRepeat.bind(this));
        }
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.addEventListener('click', this.handleShuffle.bind(this));
        }
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', this.handleVolume.bind(this));
        }

        // Добавляем обработчик для кнопки избранного в плеере
        const playerFav = document.querySelector('.player-fav');
        if (playerFav) {
            playerFav.addEventListener('click', () => {
                if (this.state.currentTrack) {
                    this.toggleFavorite(Number(this.state.currentTrack.id));
                }
            });
        }

        // Привязка обработчиков для this.audio должна быть здесь
        if (this.audio) {
            this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
            this.audio.addEventListener('ended', this.handleNext.bind(this));
        } else {
            console.error('Audio object is not initialized when attempting to add player event listeners.');
        }
    }

    private async handleLogin(e: Event): Promise<void> {
        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            const response = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                this.showMainContent();
                this.loadTracks();
            } else {
                alert(data.message || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            alert('Ошибка при попытке входа');
        }
    }

    private async handleRegister(e: Event): Promise<void> {
        e.preventDefault();
        const username = (document.getElementById('regUsername') as HTMLInputElement).value;
        const password = (document.getElementById('regPassword') as HTMLInputElement).value;

        try {
            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data: ApiResponse = await response.json();

            if (response.ok) {
                alert('Регистрация успешна! Теперь вы можете войти.');
                this.showLogin();
            } else {
                alert(data.message || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert('Ошибка при попытке регистрации');
        }
    }

    private showLogin(): void {
        this.elements.authContainer.classList.remove('hidden');
        this.elements.registerContainer.classList.add('hidden');
    }

    private showRegister(): void {
        this.elements.authContainer.classList.add('hidden');
        this.elements.registerContainer.classList.remove('hidden');
    }

    private showMainContent(): void {
        this.elements.authContainer.classList.add('hidden');
        this.elements.registerContainer.classList.add('hidden');
        this.elements.mainContainer.classList.remove('hidden');
        this.elements.player.classList.remove('hidden');

        // Создаем Audio объект и инициализируем обработчики событий плеера только один раз
        if (!this.audio) {
            console.log('Создание нового Audio объекта.');
            this.audio = new Audio();
        } else {
            console.log('Audio объект уже существует.');
        }
        if (!this.state.playerEventListenersInitialized) {
            console.log('Инициализация обработчиков событий плеера.');
            this.initPlayerEventListeners();
            this.state.playerEventListenersInitialized = true;
        } else {
            console.log('Обработчики событий плеера уже инициализированы.');
        }
    }

    private showSection(section: string): void {
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
            this.favoritesListInstance.loadFavorites();
        }
    }

    private async loadTracks(): Promise<void> {
        try {
            console.log('Начало загрузки треков...');
            const response = await fetch(`${this.API_URL}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tracks: Track[] = await response.json();
            console.log('Получены треки с сервера:', tracks);

            // Преобразуем длительность из формата 'minutes.seconds' в секунды
            const processedTracks = tracks.map(track => {
                console.log('Обработка трека:', track);
                return {
                    ...track,
                    audio_url: `data:audio/mp3;base64,${track.encoded_audio}`, // Путь относительно js/app.ts
                    duration: track.duration ? parseFloat(track.duration.toString()) * 60 : 0,
                    isFavorite: false
                };
            });

            console.log('Обработанные треки:', processedTracks);

            this.state.audios = processedTracks;
            this.renderTracks(processedTracks);
            this.favoritesListInstance.updateTracks(processedTracks);
        } catch (error) {
            console.error('Ошибка при загрузке треков:', error);
            alert('Ошибка при загрузке треков');
        }
    }

    private renderTracks(tracks: Track[]): void {
         this.elements.tracksList.innerHTML = `
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
        this.elements.tracksList.querySelectorAll('.track-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // Предотвращаем срабатывание клика по строке, если клик был по кнопке избранного или опций
                if ((e.target as HTMLElement).closest('.track-fav') || (e.target as HTMLElement).closest('.more-options')) {
                    return;
                }
                const trackId = Number((row as HTMLElement).dataset.id);
                if (trackId) {
                    const track = this.state.audios.find(t => t.id === trackId);
                    if (track) {
                        this.playTrack(track);
                    }
                }
            });
        });

        // Добавляем обработчики для кнопки избранного
        this.elements.tracksList.querySelectorAll('.track-fav').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Останавливаем всплытие события, чтобы не срабатывал клик по строке
                const trackId = Number(((e.currentTarget as HTMLElement).closest('.track-row') as HTMLElement).dataset.id);
                if (trackId) {
                    this.toggleFavorite(trackId);
                }
            });
        });
    }

    private playTrack(track: Track): void {
        if (this.state.currentTrack) {
            this.audio.pause();
        }

        this.state.currentTrack = track;
        this.audio.src = track.audio_url;
        this.audio.volume = this.state.volume;
        this.audio.play();
        this.state.isPlaying = true;
        this.updatePlayButton();
        this.updatePlayerInfo(track);
    }

    private handlePlay(): void {
        if (!this.state.currentTrack) return;

        if (this.state.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }

        this.state.isPlaying = !this.state.isPlaying;
        this.updatePlayButton();
    }

    private handlePrev(): void {
        if (!this.state.currentTrack) return;
        const currentIndex = this.state.audios.findIndex(track => track.id === this.state.currentTrack?.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.state.audios.length - 1;
        this.playTrack(this.state.audios[prevIndex]);
    }

    private handleNext(): void {
        if (!this.state.currentTrack) return;
        const currentIndex = this.state.audios.findIndex(track => track.id === this.state.currentTrack?.id);
        const nextIndex = currentIndex < this.state.audios.length - 1 ? currentIndex + 1 : 0;
        this.playTrack(this.state.audios[nextIndex]);
    }

    private handleRepeat(): void {
        this.state.repeating = !this.state.repeating;
        this.elements.repeatBtn.classList.toggle('active', this.state.repeating);
    }

    private handleShuffle(): void {
        const shuffledTracks = shuffle([...this.state.audios]);
        this.state.audios = shuffledTracks;
        this.renderTracks(shuffledTracks);
    }

    private handleVolume(e: Event): void {
        const volume = parseFloat((e.target as HTMLInputElement).value);
        this.audio.volume = volume;
        this.state.volume = volume;
    }

    private updatePlayButton(): void {
        const playIcon = this.elements.playBtn.querySelector('use');
        if (playIcon) {
            playIcon.setAttribute('xlink:href', this.state.isPlaying ? '#pause-icon' : '#play-icon');
        }
    }

    private updatePlayerInfo(track: Track): void {
        const playerTitle = document.querySelector('.player-title');
        const playerArtist = document.querySelector('.player-artist');
        const playerCover = document.querySelector('.player-cover') as HTMLImageElement;
        const playerFav = document.querySelector('.player-fav');

        if (playerTitle) playerTitle.textContent = track.title;
        if (playerArtist) playerArtist.textContent = track.artist;
        if (playerCover) playerCover.src = track.cover_url || 'image/default-cover.svg';
        if (playerFav) {
            playerFav.classList.toggle('active', track.isFavorite);
        }
    }

    private updateProgress(): void {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        if (this.elements.progress) this.elements.progress.style.width = `${progress}%`;
        if (this.elements.currentTime) this.elements.currentTime.textContent = toMinAndSec(this.audio.currentTime);
        if (this.elements.duration) this.elements.duration.textContent = toMinAndSec(this.audio.duration);
    }

    private checkAuth(): void {
        const token = localStorage.getItem('token');
        if (token) {
            this.showMainContent();
            this.loadTracks();
        }
    }

    private logout(): void {
        localStorage.removeItem('token');
        this.elements.mainContainer.classList.add('hidden');
        this.elements.player.classList.add('hidden');
        this.elements.authContainer.classList.remove('hidden');
        this.audio.pause();
        this.state.isPlaying = false;
        this.updatePlayButton();
    }

    private async toggleFavorite(trackId: number): Promise<void> {
        try {
            console.log('=== Начало toggleFavorite ===');
            console.log('ID трека:', trackId);
            
            const track = this.state.audios.find(t => t.id === trackId);
            console.log('Найден трек:', track);
            
            if (!track) {
                console.error('Трек не найден');
                return;
            }
            
            console.log('Текущее состояние избранного:', track.isFavorite);
            
            try {
                if (track.isFavorite) {
                    console.log('Удаление из избранного...');
                    await this.favoritesService.removeFromFavorites(trackId);
                    track.isFavorite = false;
                } else {
                    console.log('Добавление в избранное...');
                    await this.favoritesService.addToFavorites(trackId);
                    track.isFavorite = true;
                    console.log('Трек успешно добавлен в избранное');
                }

                // Обновляем UI сердечка в списке треков
                const favButton = this.elements.tracksList.querySelector(`[data-id="${trackId}"] .track-fav`);
                if (favButton) {
                    favButton.classList.toggle('active', track.isFavorite);
                }

                // Обновляем UI сердечка в плеере
                const playerFav = document.querySelector('.player-fav');
                if (playerFav) {
                    playerFav.classList.toggle('active', track.isFavorite);
                }

                // Обновляем список избранного всегда после изменения
                await this.favoritesListInstance.loadFavorites();
            } catch (error) {
                console.error('Ошибка при работе с избранным:', error);
                // Возвращаем предыдущее состояние
                track.isFavorite = !track.isFavorite;
                throw error;
            }
            
            console.log('=== Конец toggleFavorite ===');
        } catch (error) {
            console.error('Ошибка при обновлении избранного:', error);
            alert('Ошибка при обновлении избранного: ' + ((error as Error).message || ''));
        }
    }

    private showMessage(message: string, isError: boolean = false): void {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isError ? 'error' : 'info'}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    private updatePlayerUI(): void {
        if (this.state.currentTrack) {
            this.updatePlayerInfo(this.state.currentTrack);
            this.updatePlayButton();
        }
    }

    private play(): void {
        if (this.state.currentTrack) {
            this.audio.src = this.state.currentTrack.audio_url;
            this.audio.volume = this.state.volume;
            this.audio.play();
            this.state.isPlaying = true;
            this.updatePlayButton();
        }
    }

    private formatDuration(duration: number): string {
        const minutes = Math.floor(duration);
        const seconds = Math.round((duration - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});