export interface Track {
    id: number;
    title: string;
    artist: string;
    audio_url: string;
    duration: number;
    size_mb: number;
    cover_url?: string;
    isFavorite?: boolean;
    dateAdded?: string;
    album?: string;
    audio?: HTMLAudioElement;
    encoded_audio?: string;
}
export interface AppState {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    repeating: boolean;
    audios: Track[];
    favorites?: Track[];
    currentList?: Track[];
    activeList?: 'all' | 'favorites';
    playerEventListenersInitialized: boolean;
}
export interface ApiResponse {
    message: string;
    token?: string;
}
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
//# sourceMappingURL=types.d.ts.map