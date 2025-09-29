'use client';

import { useRef, useCallback } from 'react';
import styles from './styles.module.css';

const mockCardData = {
  id: 'SV2a-001',
  name: '妙蛙種子',
  localId: '001',
  set: { id: 'SV2a', name: '寶可夢卡牌151' },
  rarity: 'Common',
  types: ['Grass'],
  stage: 'Basic',
  images: {
    small: 'https://assets.tcgdex.net/zh-tw/SV/SV2a/001/low.png',
    large: 'https://assets.tcgdex.net/zh-tw/SV/SV2a/001/high.png',
  },
};

const PokemonCard = ({ stage = 'final' }) => {
  const cardRef = useRef(null);
  const pointerStateRef = useRef({ x: 50, y: 50 });
  const isInteractive = stage !== 'structure';
  const showEffects = stage === 'final';

  const { images, name } = mockCardData;

  // 設定卡片的 CSS 變數
  const setCardVars = useCallback((vars) => {
    const node = cardRef.current;
    if (!node) return;

    for (const [k, v] of Object.entries(vars)) {
      node.style.setProperty(k, v);

      if (k === '--pointer-x') {
        const n = parseFloat(v);
        if (!Number.isNaN(n)) pointerStateRef.current.x = n;
      }
      if (k === '--pointer-y') {
        const n = parseFloat(v);
        if (!Number.isNaN(n)) pointerStateRef.current.y = n;
      }
    }
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xp = Math.round((x / rect.width) * 100);
      const yp = Math.round((y / rect.height) * 100);
      const dx = xp - 50;
      const dy = yp - 50;

      setCardVars({
        '--pointer-x': `${xp}%`,
        '--pointer-y': `${yp}%`,
        '--rotate-x': `${dy / 2}deg`, // Y 軸偏移量拿來轉 X 軸
        '--rotate-y': `${-dx / 3.5}deg`, // X 軸偏移量拿來轉 Y 軸 (記得加負號)
        '--rotator-transition': '120ms',
        '--glare-opacity': '1',
        '--glare-transition': '180ms',
      });
    },
    [setCardVars]
  );

  const onMouseLeave = useCallback(() => {
    setCardVars({
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
      '--rotator-transition': '600ms',
      '--glare-opacity': '0',
      '--glare-transition': '600ms',
    });
  }, [setCardVars]);

  return (
    <div className={styles.cardContainer} data-stage={stage}>
      <div ref={cardRef} className={styles.card} data-stage={stage}>
        <div
          onMouseMove={isInteractive ? onMouseMove : undefined}
          onMouseLeave={isInteractive ? onMouseLeave : undefined}
          className={styles.rotator}
          data-stage={stage}
        >
          <img src={images.small} alt={`Front of ${name} Pokemon Card`} />
          {showEffects ? <div className={styles.glare} /> : null}
        </div>
      </div>
    </div>
  );
};

export default { PokemonCard };
