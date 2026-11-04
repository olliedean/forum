import { FaFolderOpen, FaPen, FaPlus, FaTrash } from "react-icons/fa";

export default function NodesPage() {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex items-center gap-2 self-start rounded bg-[#1e2227] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2b3038]"
          type="button"
        >
          <FaPlus aria-hidden="true" />
          Add category
        </button>
      </header>

      <section aria-label="Example forum categories" className="space-y-4">
        {Array(2)
          .fill(null)
          .map((_, categoryIndex) => (
            <section
              aria-labelledby={`category-${categoryIndex + 1}`}
              className="overflow-hidden rounded-md border border-[#e2e8f0] bg-white"
              key={categoryIndex}
            >
              <div className="flex flex-col gap-3 border-b border-[#e2e8f0] bg-[#fafbfc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <FaFolderOpen
                    aria-hidden="true"
                    className="text-sm text-blue-600"
                  />
                  <div>
                    <h2
                      className="text-[13px] font-bold text-gray-900"
                      id={`category-${categoryIndex + 1}`}
                    >
                      Category {categoryIndex + 1}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Lorem ipsum dolor sit amet.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    type="button"
                  >
                    ↓
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    type="button"
                  >
                    <FaPlus aria-hidden="true" />
                    Add node
                  </button>
                  <button
                    aria-label={`Edit category ${categoryIndex + 1}`}
                    className="rounded border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
                    type="button"
                  >
                    <FaPen aria-hidden="true" />
                  </button>
                  <button
                    aria-label={`Delete category ${categoryIndex + 1}`}
                    className="rounded border border-gray-300 bg-white p-2 text-red-600 hover:bg-red-50"
                    type="button"
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                      <th className="px-3 py-2.5">Node</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Threads</th>
                      <th className="px-3 py-2.5 text-right">Posts</th>
                      <th className="px-3 py-2.5">Visibility</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {Array(3)
                      .fill(null)
                      .map((_, nodeIndex) => (
                        <tr
                          className="hover:bg-gray-50/60"
                          key={nodeIndex}
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">
                            Node {nodeIndex + 1}
                          </td>
                          <td className="min-w-56 px-3 py-3 text-gray-600">
                            Lorem ipsum dolor sit amet.
                          </td>
                          <td className="px-3 py-3 text-right font-mono">0</td>
                          <td className="px-3 py-3 text-right font-mono">0</td>
                          <td className="whitespace-nowrap px-3 py-3 text-emerald-700">
                            Visible
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                aria-label={`Move node ${nodeIndex + 1} up`}
                                className="rounded px-2 py-1.5 text-gray-600 hover:bg-gray-100"
                                type="button"
                              >
                                ↑
                              </button>
                              <button
                                aria-label={`Move node ${nodeIndex + 1} down`}
                                className="rounded px-2 py-1.5 text-gray-600 hover:bg-gray-100"
                                type="button"
                              >
                                ↓
                              </button>
                              <button
                                aria-label={`Edit node ${nodeIndex + 1}`}
                                className="rounded p-2 text-blue-600 hover:bg-blue-50"
                                type="button"
                              >
                                <FaPen aria-hidden="true" />
                              </button>
                              <button
                                aria-label={`Delete node ${nodeIndex + 1}`}
                                className="rounded p-2 text-red-600 hover:bg-red-50"
                                type="button"
                              >
                                <FaTrash aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
      </section>
    </div>
  );
}
