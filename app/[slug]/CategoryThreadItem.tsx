import { FiMessageSquare } from "react-icons/fi";

export default function CategoryThreadItem() {
  return (
    <article className="grid min-h-[76px] grid-cols-[44px_minmax(0,1fr)_58px_58px] border-b border-slate-200 bg-white transition-colors hover:bg-slate-50 sm:grid-cols-[48px_minmax(0,1fr)_72px_72px_150px]">
      <div className="flex items-center justify-center text-slate-500">
        <FiMessageSquare aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0 self-center py-3 pr-2">
        <a
          href="#"
          className="block truncate text-[15px] font-medium text-[#327db4] hover:underline"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </a>
        <p className="mt-1 truncate text-xs text-slate-500">
          by <a href="#" className="text-[#327db4] hover:underline">Lorem ipsum</a>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center border-l border-slate-200 bg-slate-50 text-center">
        <strong className="text-sm font-medium text-slate-600">0</strong>
        <span className="text-[10px] text-slate-400">views</span>
      </div>
      <div className="flex flex-col items-center justify-center border-x border-slate-200 bg-slate-50 text-center">
        <strong className="text-sm font-medium text-slate-600">0</strong>
        <span className="text-[10px] text-slate-400">replies</span>
      </div>
      <div className="hidden flex-col justify-center px-3 text-right text-xs text-slate-500 sm:flex">
        <span>Lorem ipsum</span>
        <span className="mt-1 text-[11px] text-slate-400">0 minutes ago</span>
      </div>
    </article>
  );
}
