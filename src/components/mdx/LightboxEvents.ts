export const LIGHTBOX_EVENT = 'open-lightbox';

export interface LightboxPayload {
  slides: { src: string; alt?: string }[];
  index: number;
}

export const openLightbox = (detail: LightboxPayload) => {
  window.dispatchEvent(new CustomEvent(LIGHTBOX_EVENT, { detail }));
};
