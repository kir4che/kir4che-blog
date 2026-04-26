import type { ReactNode } from 'react';
import type { TaxonomyItem } from '@/types';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Editor from './Editor';

interface PostData {
  id: string;
  slug: string;
  lang: string;
  title: string;
  content: string;
  description: string;
  coverImage: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  draft: boolean;
  showUpdatedAt: boolean;
  protected: boolean;
  updatedAt: string;
  date: string;
}

interface EditorProps {
  post: PostData | null;
  isEditing: boolean;
  defaultDate: string;
  previewUrl: string;
  allCategories: TaxonomyItem[];
  allTags: TaxonomyItem[];
}

interface EditorWithBoundaryProps extends EditorProps {
  fallbackUI?: ReactNode;
}

const EditorWithBoundary = ({ fallbackUI, ...props }: EditorWithBoundaryProps) => (
  <ErrorBoundary
    fallback={
      fallbackUI || (
        <div className="flex-center min-h-96">
          <div className="w-96 max-w-[85vw] rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/20">
            <h2 className="mb-2 font-semibold text-red-900 dark:text-red-200">編輯器載入失敗</h2>
            <p className="mb-4 text-sm text-red-800 dark:text-red-300">
              請重新整理頁面或返回後重試
            </p>
            <a
              href="/admin"
              className="inline-block rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              返回管理後台
            </a>
          </div>
        </div>
      )
    }
  >
    <Editor {...props} />
  </ErrorBoundary>
);

export default EditorWithBoundary;
