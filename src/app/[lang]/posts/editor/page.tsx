import { notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

const EditorPage = () => {
  if (process.env.NODE_ENV === 'production') notFound();

  const EditorClient = nextDynamic(() => import('./client'), {
    ssr: false,
    loading: () => null,
  });

  return <EditorClient />;
};

export default EditorPage;
