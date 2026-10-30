import Link from "next/link";
import { FiMessageSquare } from "react-icons/fi";

export default function Category() {
  return (
    <article className="grid min-h-[58px] grid-cols-[44px_minmax(0,1fr)_56px_56px] border-b border-slate-200 bg-white transition-colors hover:bg-[#f8fbff] lg:grid-cols-[48px_minmax(0,1fr)_190px_68px_68px]">
      <div className="flex items-center justify-center text-slate-700">
        <FiMessageSquare aria-hidden="true" className="size-6 stroke-[1.8]" />
      </div>
      <div className="min-w-0 self-center py-2 pr-2">
        <div className="truncate leading-5">
          <Link className="text-base font-bold text-[#327db4] hover:underline" href="/general">Lorem ipsum</Link>
          <span className="ml-1 text-[11px] text-[#999]">(0 Viewers)</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-[15px] text-[#666]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <p className="mt-1 hidden text-[11px] font-medium text-[#327db4] lg:block">
          Lorem ipsum
        </p>
      </div>
      <div className="hidden min-w-0 self-stretch border-l border-[#dce4eb] bg-[#f7fbff] px-2 py-1 text-right lg:flex lg:flex-col lg:justify-center">
        <a className="truncate text-[11px] font-medium leading-[15px] text-[#327db4]" href="#">
          Lorem ipsum dolor sit amet
        </a>
        <p className="truncate text-[11px] leading-[15px] text-[#777]">
          by <a href="#" className="text-[#327db4] underline">Lorem ipsum</a>, 0 mins ago
        </p>
      </div>
      <div className="flex flex-col items-center justify-center border-x border-slate-200 bg-slate-50 text-center">
        <strong className="text-base leading-[19px] text-[#666]">0</strong>
        <span className="text-[11px] leading-[14px] text-[#aaa]">threads</span>
      </div>
      <div className="flex flex-col items-center justify-center border-r border-slate-200 bg-slate-50 text-center">
        <strong className="text-base leading-[19px] text-[#666]">0</strong>
        <span className="text-[11px] leading-[14px] text-[#aaa]">posts</span>
      </div>
    </article>
  );
}
