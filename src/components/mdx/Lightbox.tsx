import 'yet-another-react-lightbox/styles.css';

import { useEffect, useState } from 'react';
import YALightbox from 'yet-another-react-lightbox';

interface LightboxPayload {
  slides: { src: string; alt?: string }[];
  index: number;
}

export const LIGHTBOX_EVENT = 'open-lightbox';

export const openLightbox = (detail: LightboxPayload) => {
  window.dispatchEvent(new CustomEvent(LIGHTBOX_EVENT, { detail }));
};

const Lightbox = () => {
  const [state, setState] = useState<{ open: boolean } & LightboxPayload>({
    open: false,
    slides: [],
    index: 0,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<LightboxPayload>;
      setState({ open: true, slides: detail.slides, index: detail.index });
    };

    window.addEventListener(LIGHTBOX_EVENT, handler);
    return () => window.removeEventListener(LIGHTBOX_EVENT, handler);
  }, []);

  return (
    <YALightbox
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
