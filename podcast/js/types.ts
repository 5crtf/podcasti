// Типы для треков
export interface Track {
    id: number;
    title: string;
    artist: string;
    audio_url: string;
    duration: number; // Длительность в секундах
    size_mb: number;
    cover_url?: string; // Опциональная обложка трека
    isFavorite?: boolean; // Добавлено для отслеживания избранного
    dateAdded?: string; // Дата добавления трека
    album?: string; // Добавлено для альбома
    audio?: HTMLAudioElement;
    encoded_audio?: string; // base64 аудиоданные (опционально)
}

// Типы для состояния приложения
export interface AppState {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    repeating: boolean; // Добавлено для повтора
    audios: Track[]; // Добавлено для хранения списка треков
    favorites?: Track[];
    currentList?: Track[];
    activeList?: 'all' | 'favorites';
    playerEventListenersInitialized: boolean; // Добавлено для контроля инициализации обработчиков плеера
}

// Типы для ответов API
export interface ApiResponse {
    message: string;
    token?: string;
}

// Типы для DOM элементов
export interface AppElements {
    authContainer: HTMLDivElement;
    registerContainer: HTMLDivElement;
    mainContainer: HTMLDivElement;
    loginForm: HTMLFormElement;
    registerForm: HTMLFormElement;
    showRegister: HTMLAnchorElement;
    showLogin: HTMLAnchorElement;
    tracksList: HTMLDivElement;
    favoritesList: HTMLDivElement;
    favoritesSection: HTMLDivElement;
    tracksSection: HTMLDivElement;
    player: HTMLDivElement;
    playBtn: HTMLButtonElement;
    prevBtn: HTMLButtonElement;
    nextBtn: HTMLButtonElement;
    repeatBtn: HTMLButtonElement;
    shuffleBtn: HTMLButtonElement;
    volumeSlider: HTMLInputElement;
    progress: HTMLDivElement;
    currentTime: HTMLSpanElement;
    duration: HTMLSpanElement;
    logoutBtn: HTMLAnchorElement;
} 