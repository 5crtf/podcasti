import { Track, AppState, AppElements } from './types.js';
export declare function playTrack(track: Track, state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function handlePlay(state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function handlePrev(state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function handleNext(state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function handleRepeat(state: AppState, elements: AppElements): void;
export declare function handleShuffle(state: AppState, elements: AppElements): void;
export declare function handleVolume(e: Event, state: AppState, audio: HTMLAudioElement): void;
export declare function updatePlayButton(state: AppState, elements: AppElements): void;
export declare function updatePlayerInfo(track: Track, elements: AppElements): void;
export declare function updateProgress(state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function play(state: AppState, audio: HTMLAudioElement, elements: AppElements): void;
export declare function formatDuration(duration: number): string;
//# sourceMappingURL=player.d.ts.map