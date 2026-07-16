type WoodenFishAudio = Pick<HTMLAudioElement, 'play' | 'volume'>;
type WoodenFishAudioConstructor = new (src: string) => WoodenFishAudio;

export const playWoodenFishSound = (
  soundSrc: string,
  AudioConstructor: WoodenFishAudioConstructor = Audio
) => {
  const audio = new AudioConstructor(soundSrc);

  audio.volume = 0.35;
  void audio.play();
};
