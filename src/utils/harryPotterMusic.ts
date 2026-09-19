/**
 * Harry Potter Theme Audio Player
 * Fully optimized for all platforms: Desktop, iOS Safari, Android Chrome, and Tablets.
 */

const AUDIO_SOURCES = [
  "/audio/harry_potter.mp3",
  "/audio/harry_potter.m4a",
  "https://www.image2url.com/r2/default/videos/1789849519701-ec440e12-12ec-4772-a565-191f90a25c52.mp4"
];

class HarryPotterMusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isMuted = false;
  private currentSourceIndex = 0;
  private unlockAttached = false;
  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean }) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      // By default, music should play automatically unless explicitly muted by user
      const savedMute = localStorage.getItem("quoi_hp_music_muted");
      this.isMuted = savedMute === "true";
    }
  }

  private initAudio(): HTMLAudioElement | null {
    if (this.audio) return this.audio;
    if (typeof window === "undefined") return null;

    const audio = new Audio();
    audio.src = AUDIO_SOURCES[this.currentSourceIndex];
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.55;
    audio.muted = this.isMuted;
    // Essential for iOS Safari to keep audio active inline
    (audio as unknown as { playsInline?: boolean }).playsInline = true;

    // Error fallback to next source in list
    audio.addEventListener("error", () => {
      if (this.currentSourceIndex < AUDIO_SOURCES.length - 1) {
        this.currentSourceIndex++;
        audio.src = AUDIO_SOURCES[this.currentSourceIndex];
        audio.load();
        if (!this.isMuted) {
          audio.play().catch(() => {});
        }
      }
    });

    audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.notify();
    });

    audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio = audio;
    return audio;
  }

  public start() {
    if (this.isMuted) return;

    const audio = this.initAudio();
    if (!audio) return;

    audio.muted = false;
    audio.volume = 0.55;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.isMuted = false;
          this.notify();
        })
        .catch(() => {
          // On mobile, initial unprompted autoplay is blocked by browser policy.
          // Setup instant gesture unlock on the first user touch or click anywhere.
          this.setupMobileUnlock();
        });
    }
  }

  private setupMobileUnlock() {
    if (this.unlockAttached || typeof window === "undefined") return;
    this.unlockAttached = true;

    const unlock = () => {
      if (this.audio && !this.isMuted) {
        this.audio.muted = false;
        this.audio.volume = 0.55;
        this.audio
          .play()
          .then(() => {
            this.isPlaying = true;
            this.notify();
          })
          .catch(() => {
            // Retry loading if needed
            this.audio?.load();
            this.audio?.play().catch(() => {});
          });
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("touchstart", unlock, { capture: true });
      window.removeEventListener("touchend", unlock, { capture: true });
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("click", unlock, { capture: true });
      this.unlockAttached = false;
    };

    window.addEventListener("touchstart", unlock, { capture: true, once: true });
    window.addEventListener("touchend", unlock, { capture: true, once: true });
    window.addEventListener("pointerdown", unlock, { capture: true, once: true });
    window.addEventListener("click", unlock, { capture: true, once: true });
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): boolean {
    const audio = this.initAudio();
    if (!audio) return this.isMuted;

    if (this.isPlaying && !this.isMuted && !audio.paused) {
      // User requests mute
      this.isMuted = true;
      audio.muted = true;
      audio.pause();
      localStorage.setItem("quoi_hp_music_muted", "true");
      this.isPlaying = false;
      this.notify();
      return true;
    } else {
      // User requests unmuting/playback
      this.isMuted = false;
      audio.muted = false;
      audio.volume = 0.55;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.notify();
          })
          .catch(() => {
            audio.load();
            audio.play().then(() => {
              this.isPlaying = true;
              this.notify();
            }).catch(() => {});
          });
      }

      localStorage.setItem("quoi_hp_music_muted", "false");
      this.notify();
      return false;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(listener: (state: { isPlaying: boolean; isMuted: boolean }) => void) {
    this.listeners.add(listener);
    listener({ isPlaying: this.isPlaying, isMuted: this.isMuted });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = { isPlaying: this.isPlaying, isMuted: this.isMuted };
    this.listeners.forEach((l) => l(state));
  }
}

export const hpMusicPlayer = new HarryPotterMusicPlayer();
