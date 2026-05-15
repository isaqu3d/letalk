import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export const Spinner = ({
  className = "h-4 w-4",
  label = "Carregando",
}: SpinnerProps) => (
  <Loader2
    aria-hidden="true"
    role="status"
    aria-label={label}
    className={`animate-spin ${className}`}
  />
);
