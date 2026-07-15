import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import lightboxStylesUrl from 'yet-another-react-lightbox/styles.css?url';

interface LightboxPayload {
  slides: { src: string; alt?: string }[];
  index: number;
}

export const LIGHTBOX_EVENT = 'open-lightbox';

type LoadedLightbox = ComponentType<{
  open: boolean;
  index: number;
  slides: LightboxPayload['slides'];
  close: () => void;
  controller: { closeOnBackdropClick: boolean };
  styles: { root: CSSProperties & { '--yarl__color_backdrop': string } };
}>;

export const openLightbox = (detail: LightboxPayload) => {
  window.dispatchEvent(new CustomEvent(LIGHTBOX_EVENT, { detail }));
};

// 動態載入 lightbox 的樣式表，避免在 SSR 時出現錯誤。
const ensureLightboxStylesheet = () => {
  if (document.querySelector<HTMLLinkElement>('link[data-lightbox-styles]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = lightboxStylesUrl;
  link.dataset.lightboxStyles = 'true';
  document.head.append(link);
};

const Lightbox = () => {
  const [state, setState] = useState<{ open: boolean } & LightboxPayload>({
    open: false,
    slides: [],
    index: 0,
  });
  const [LightboxComponent, setLightboxComponent] = useState<LoadedLightbox | null>(null);
  const loadPromiseRef = useRef<Promise<LoadedLightbox> | null>(null);

  useEffect(() => {
    const loadLightbox = () => {
      ensureLightboxStylesheet();
      loadPromiseRef.current ??= import('yet-another-react-lightbox').then(
        (module) => module.default as unknown as LoadedLightbox
      );

      return loadPromiseRef.current;
    };

    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<LightboxPayload>;
      setState({ open: true, slides: detail.slides, index: detail.index });
      void loadLightbox().then((Component) => setLightboxComponent(() => Component));
    };

    window.addEventListener(LIGHTBOX_EVENT, handler);
    return () => window.removeEventListener(LIGHTBOX_EVENT, handler);
  }, []);

  if (!LightboxComponent) return null;

  return (
    <LightboxComponent
      open={state.open}
      index={state.index}
      slides={state.slides}
      close={() => setState((prev) => ({ ...prev, open: false }))}
      controller={{ closeOnBackdropClick: true }}
      styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.85)' } }}
    />
  );
};

export default Lightbox;
