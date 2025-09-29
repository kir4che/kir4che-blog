'use client';

import { notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';

const EditorClient = nextDynamic(() => import('./client'), {
  ssr: false,
  loading: () => null,
});

const EditorPage = () => {
  if (process.env.NODE_ENV === 'production') notFound();

  return <EditorClient />;
};

export default EditorPage;
