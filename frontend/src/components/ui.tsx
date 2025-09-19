import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button(
  { children, variant = "primary", className, ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }
) {
  const base =
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];

  return (
    <button className={clsx(base, styles, className)} {...props}>
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="block w-full rounded-md border-gray-300 shadow-sm
                 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      {...props}
    />
  );
}

export function Badge(
  { children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "yellow" }
) {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}