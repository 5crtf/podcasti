import { Track, AppState, AppElements } from '../types.js';
import { shuffle, toMinAndSec } from '../utils.js';

export function playTrack(track: Track, state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    if (state.currentTrack) {
        audio.pause();
    }
    state.currentTrack = track;
    audio.src = track.audio_url;
    audio.volume = state.volume;
    audio.play();
    state.isPlaying = true;
    updatePlayButton(state, elements);
    updatePlayerInfo(track, elements);
}

export function handlePlay(state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    if (!state.currentTrack) return;
    if (state.isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    state.isPlaying = !state.isPlaying;
    updatePlayButton(state, elements);
}

export function handlePrev(state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    if (!state.currentTrack) return;
    const currentIndex = state.audios.findIndex(track => track.id === state.currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : state.audios.length - 1;
    playTrack(state.audios[prevIndex], state, audio, elements);
}

export function handleNext(state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    if (!state.currentTrack) return;
    const currentIndex = state.audios.findIndex(track => track.id === state.currentTrack?.id);
    const nextIndex = currentIndex < state.audios.length - 1 ? currentIndex + 1 : 0;
    playTrack(state.audios[nextIndex], state, audio, elements);
}

export function handleRepeat(state: AppState, elements: AppElements): void {
    state.repeating = !state.repeating;
    elements.repeatBtn.classList.toggle('active', state.repeating);
}

export function handleShuffle(state: AppState, elements: AppElements): void {
    const shuffledTracks = shuffle([...state.audios]);
    state.audios = shuffledTracks;
}

export function handleVolume(e: Event, state: AppState, audio: HTMLAudioElement): void {
    const volume = parseFloat((e.target as HTMLInputElement).value);
    audio.volume = volume;
    state.volume = volume;
}

export function updatePlayButton(state: AppState, elements: AppElements): void {
    const playIcon = elements.playBtn.querySelector('use');
    if (playIcon) {
        playIcon.setAttribute('xlink:href', state.isPlaying ? '#pause-icon' : '#play-icon');
    }
}

export function updatePlayerInfo(track: Track, elements: AppElements): void {
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

export function updateProgress(state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    const progress = (audio.currentTime / audio.duration) * 100;
    if (elements.progress) elements.progress.style.width = `${progress}%`;
    if (elements.currentTime) elements.currentTime.textContent = toMinAndSec(audio.currentTime);
    if (elements.duration) elements.duration.textContent = toMinAndSec(audio.duration);
}

export function play(state: AppState, audio: HTMLAudioElement, elements: AppElements): void {
    if (state.currentTrack) {
        audio.src = state.currentTrack.audio_url;
        audio.volume = state.volume;
        audio.play();
        state.isPlaying = true;
        updatePlayButton(state, elements);
    }
}

export function formatDuration(duration: number): string {
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 