import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Settings2,
} from 'lucide-react';

interface EditorHeaderProps {
  isSaving: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const EditorHeader = ({
  isSaving,
  isPublishing,
  onSaveDraft,
  onPublish,
  isSidebarCollapsed,
  onToggleSidebar,
}: EditorHeaderProps) => (
  <div className='flex flex-wrap items-center gap-3 rounded-xl bg-linear-to-r from-pink-600/90 via-pink-500 to-orange-400 px-4 py-3 text-white'>
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={onToggleSidebar}
        aria-label={isSidebarCollapsed ? '展開側邊欄' : '收合側邊欄'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={16} className='max-md:rotate-90' />
        ) : (
          <ChevronLeft size={16} className='max-md:rotate-90' />
        )}
      </button>
      <h2 className='text-lg font-semibold'>文章編輯器</h2>
    </div>
    <div className='ml-auto flex items-center gap-2 text-sm'>
      <Link
        href='/'
        className='flex items-center gap-1 rounded border border-white/40 px-3 py-1 text-white transition hover:bg-white/15'
      >
        <ArrowLeft size={16} />
        首頁
      </Link>
      <button
        type='button'
        onClick={onSaveDraft}
        disabled={isSaving}
        className='flex items-center gap-1 rounded bg-white/20 px-3 py-1 hover:bg-white/30 disabled:opacity-60'
      >
        <Save size={16} />
        儲存為草稿
      </button>
      <button
        type='button'
        onClick={onPublish}
        disabled={isSaving}
        className='flex items-center gap-1 rounded bg-white px-3 py-1 font-semibold text-pink-700 disabled:opacity-60'
      >
        {isSaving && isPublishing && (
          <Loader2 size={16} className='animate-spin' />
        )}
        發佈
      </button>
    </div>
  </div>
);

export default EditorHeader;
