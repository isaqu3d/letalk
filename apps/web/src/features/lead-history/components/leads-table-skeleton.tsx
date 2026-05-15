import { Skeleton } from "@/components/skeleton";

interface LeadsTableSkeletonProps {
  pageSize?: number;
}

const COLUMN_WIDTHS = ["19%", "22%", "12%", "13%", "17%", "17%"] as const;
const ROWS_DEFAULT = 5;

export const LeadsTableSkeleton = ({
  pageSize = ROWS_DEFAULT,
}: LeadsTableSkeletonProps) => (
  <>
    <ul className="flex flex-col gap-3 md:hidden" aria-busy="true">
      {Array.from({ length: pageSize }).map((_, index) => (
        <li
          key={`m-${index}`}
          className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
    <div
      className="hidden overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm md:block"
      aria-busy="true"
    >
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          {COLUMN_WIDTHS.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead className="bg-surface-soft">
          <tr>
            {["Contato", "Empresa", "Segmento", "Faixa", "Cadastrado em", ""].map(
              (label, index) => (
                <th
                  key={index}
                  className={`border-r border-surface-border px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft last:border-r-0 ${
                    index >= 4 ? "text-center" : "text-left"
                  }`}
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: pageSize }).map((_, rowIndex) => (
            <tr
              key={`r-${rowIndex}`}
              className="h-[72px] border-t border-surface-border"
            >
              <td className="border-r border-surface-border px-4 py-3.5 align-middle">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </td>
              <td className="border-r border-surface-border px-4 py-3.5 align-middle">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </td>
              <td className="border-r border-surface-border px-4 py-3.5 align-middle">
                <Skeleton className="h-5 w-20 rounded-full" />
              </td>
              <td className="border-r border-surface-border px-4 py-3.5 align-middle">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="border-r border-surface-border px-4 py-3.5 align-middle text-center">
                <Skeleton className="mx-auto h-4 w-28" />
              </td>
              <td className="border-r border-surface-border px-4 py-3.5 align-middle text-center last:border-r-0">
                <Skeleton className="mx-auto h-4 w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
