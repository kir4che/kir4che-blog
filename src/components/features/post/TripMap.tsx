import { useEffect, useMemo, useRef } from 'react';

import type { TripPlace } from '@/types';

import leafletStylesUrl from 'leaflet/dist/leaflet.css?url';

interface TripMapProps {
  places: TripPlace[];
}

// 確保 leaflet.css 只被注入一次（使用 data-leaflet-styles 標記）
const ensureLeafletStylesheet = () => {
  if (document.querySelector<HTMLLinkElement>('link[data-leaflet-styles]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = leafletStylesUrl;
  link.dataset.leafletStyles = 'true';
  document.head.append(link);
};

const sanitizeEmoji = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TripMap = ({ places }: TripMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<import('leaflet').Map | null>(null);
  const layerRef = useRef<import('leaflet').LayerGroup | null>(null);

  // 篩掉不完整座標或 icon 為空的景點
  const validPlaces = useMemo(
    () =>
      places.filter(
        (p) =>
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng) &&
          typeof p.icon === 'string' &&
          p.icon.trim().length > 0
      ),
    [places]
  );

  // 延遲載入 leaflet（避免 SSG bundle），初始化地圖與 tile layer。
  useEffect(() => {
    if (!containerRef.current || validPlaces.length === 0) return;

    let mounted = true;

    const init = async () => {
      ensureLeafletStylesheet();

      const L = (await import('leaflet')).default;
      if (!mounted || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      layer.clearLayers();

      const bounds = L.latLngBounds([]);

      validPlaces.forEach((place) => {
        const icon = L.divIcon({
          html: `<span class="trip-map-emoji">${sanitizeEmoji(place.icon)}</span>`,
          className: 'trip-map-emoji-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        // 把座標加到地圖上，且點擊後可開啟 Google Maps。
        L.marker([place.lat, place.lng], { icon })
          .addTo(layer)
          .on('click', () => {
            const url = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
            window.open(url, '_blank');
          });
        bounds.extend([place.lat, place.lng]);
      });

      if (validPlaces.length === 1) {
        const [only] = validPlaces;
        map.setView([only.lat, only.lng], 13);
        return;
      }

      map.fitBounds(bounds, { padding: [24, 24] });
    };

    init();

    return () => {
      mounted = false;
    };
  }, [validPlaces]);

  // unmount 時銷毀 leaflet 地圖實例
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerRef.current = null;
    };
  }, []);

  if (validPlaces.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative z-0 aspect-video max-h-[32vh] min-h-45 w-full overflow-hidden rounded-xl border border-pink-200/80 sm:min-h-60 dark:border-pink-300/30 [&_.trip-map-emoji]:text-xl"
      aria-label="Trip map"
    />
  );
};

export default TripMap;
