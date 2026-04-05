"use client";

import { ButtonHTMLAttributes, HTMLAttributes, forwardRef } from "react";

/* ─── Button ─── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-600 text-sand-50 hover:bg-amber-700 font-sans font-medium",
  secondary:
    "bg-sand-100 text-earth-700 hover:bg-sand-200 font-sans font-medium",
  ghost:
    "bg-transparent text-earth-500 hover:text-earth-700 font-sans",
  destructive:
    "bg-rose text-sand-50 hover:opacity-90 font-sans font-medium",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-lg px-8 py-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-lg transition-colors duration-300 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${buttonStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ transitionTimingFunction: "var(--huma-ease)" }}
      {...props}
    />
  )
);
Button.displayName = "Button";

/* ─── Card ─── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "warm";
}

const cardVariants = {
  default: "bg-sand-50 border border-sand-200",
  elevated: "bg-sand-50 border border-sand-200 shadow-sm",
  warm: "bg-sand-100 border border-sand-300",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg p-6 ${cardVariants[variant]} ${className}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ─── Card Header (serif title) ─── */

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-serif text-xl font-bold text-sage-700 ${className}`}
      {...props}
    />
  );
}

/* ─── Destructive Text Button (for Remove/Delete actions) ─── */

export function DestructiveAction({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`font-sans text-sm text-rose hover:opacity-70
        bg-transparent border-none cursor-pointer transition-opacity ${className}`}
      {...props}
    />
  );
}

/* ─── Section Heading ─── */

export function SectionHeading({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`font-serif text-2xl text-sage-700 ${className}`}
      {...props}
    />
  );
}

/* ─── Body Text ─── */

export function Prose({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`font-serif text-lg leading-relaxed text-earth-800 ${className}`}
      {...props}
    />
  );
}
