import { cn } from "@/lib/utils";

const statusConfig: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  submitted: "bg-slate-100 text-slate-700 border-slate-200",
  approved_dept: "bg-indigo-100 text-indigo-700 border-indigo-200",
  approved_dean: "bg-violet-100 text-violet-700 border-violet-200",
  approved_registrar: "bg-emerald-100 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  under_review: "bg-purple-100 text-purple-700 border-purple-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const styles = statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200";
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider",
      styles,
      className
    )}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
