import { Skeleton } from "@/components/skeleton";

const InfoRowSkeleton = () => (
  <div className="flex flex-col gap-1.5">
    <Skeleton className="h-2.5 w-20" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const LeadDetailSkeleton = () => (
  <article className="space-y-6" aria-busy="true">
    <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </header>
      <dl className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <InfoRowSkeleton key={index} />
        ))}
      </dl>
    </section>
    <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
      <Skeleton className="mb-5 h-5 w-24" />
      <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <InfoRowSkeleton key={index} />
        ))}
      </dl>
    </section>
  </article>
);
