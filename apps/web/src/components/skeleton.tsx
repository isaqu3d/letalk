interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-surface-border/60 ${className}`}
  />
);
