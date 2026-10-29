import { statusLabels, type ProjectStatus } from "@/lib/portfolio";

export function StatusPill({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={className ? `status-pill ${className}` : "status-pill"}
      data-status={status}
    >
      <i aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
