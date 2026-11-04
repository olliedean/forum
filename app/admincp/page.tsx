import {
  FaComments,
  FaGavel,
  FaStar,
  FaUsers,
} from "react-icons/fa";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <section
        aria-label="Forum statistics"
        className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex items-center justify-between rounded-md border border-[#e2e8f0] bg-white p-3.5">
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Total posts
            </h2>
            <p className="mt-0.5 font-mono text-xl font-bold text-gray-900">
              0
            </p>
            <p className="mt-1 text-[11px] text-gray-500">+0 today</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
            <FaComments aria-hidden="true" className="text-lg" />
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-[#e2e8f0] bg-white p-3.5">
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Active users
            </h2>
            <p className="mt-0.5 font-mono text-xl font-bold text-gray-900">
              0
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              0 members · 0 guests
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600">
            <FaUsers aria-hidden="true" className="text-lg" />
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-[#e2e8f0] bg-white p-3.5">
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Ratings (24 hours)
            </h2>
            <p className="mt-0.5 font-mono text-xl font-bold text-gray-900">
              0
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              0 Agree · 0 Winner
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-amber-50 text-amber-600">
            <FaStar aria-hidden="true" className="text-lg" />
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-[#e2e8f0] bg-white p-3.5">
          <div>
            <h2 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Moderation actions today
            </h2>
            <p className="mt-0.5 font-mono text-xl font-bold text-gray-900">
              0
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              0 bans · 0 posts removed
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
            <FaGavel aria-hidden="true" className="text-lg" />
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#e2e8f0] bg-white">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#fafbfc] px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-gray-900">
              Recent administrator activity
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Latest actions recorded in the admin log.
            </p>
          </div>
          <span className="text-xs text-gray-500">Today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                <th className="px-3 py-2.5">Time</th>
                <th className="px-3 py-2.5">Administrator</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-3 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              { Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50/60">
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-gray-500">
                  0
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900">
                  User
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-gray-400">
                    (superadmin)
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  user banned
                </td>
                <td className="min-w-64 px-3 py-2.5 text-gray-600">
                  Lorem ipsum
                </td>
              </tr>
              )) }
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#e2e8f0] bg-gray-50/75 px-4 py-2 text-xs text-gray-500">
          Showing 0 actions
        </div>
      </section>
    </div>
  );
}
