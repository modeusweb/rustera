import type { ReactNode, ButtonHTMLAttributes } from "react";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover border border-transparent font-semibold",
  secondary:
    "bg-raised text-fg hover:bg-hover border border-line-strong font-medium",
  ghost: "bg-transparent text-muted hover:bg-hover hover:text-fg border border-transparent",
  danger: "bg-transparent text-error hover:bg-error/10 border border-error/40 font-medium",
};

export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "error";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-hover text-muted-strong border-line",
    accent: "bg-accent/10 text-accent border-accent/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    error: "bg-error/10 text-error border-error/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return <Tag className={`panel p-5 ${className}`}>{children}</Tag>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-md ${className}`} />;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon = "info",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: "info" | "warning";
}) {
  const Icon = icon === "warning" ? ExclamationTriangleIcon : InformationCircleIcon;
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Icon aria-hidden="true" className="h-8 w-8 text-muted" />
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {action}
    </div>
  );
}

export function StatusMessage({
  children,
  tone = "warning",
}: {
  children: ReactNode;
  tone?: "warning" | "error" | "success" | "info";
}) {
  const tones = {
    warning: "border-warning/30 bg-warning/10 text-warning",
    error: "border-error/30 bg-error/10 text-error",
    success: "border-success/30 bg-success/10 text-success",
    info: "border-accent/30 bg-accent/10 text-accent",
  };
  return (
    <div role="status" className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-line py-3 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="break-words text-sm text-fg">{value ?? <span className="text-muted">Not available</span>}</dd>
    </div>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      RUSTERA is an independent project. It is not affiliated with, endorsed by, or officially connected to RuStore
      or VK. Application names, icons and descriptions belong to their respective owners. Downloaded files are
      untrusted — verify compatibility, legality and trustworthiness before installation.
    </p>
  );
}
