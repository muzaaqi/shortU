import type * as React from "react";
import { cn } from "~/lib/utils";

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      data-slot="field"
      className={cn(
        "group/field flex flex-col gap-1.5",
        orientation === "horizontal" && "flex-row items-center gap-2",
        className
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-semibold text-foreground tracking-tight select-none",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  errors,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<string | { message?: string } | undefined>;
}) {
  const content =
    children ||
    errors
      ?.filter(Boolean)
      .map((e) => (typeof e === "string" ? e : e?.message))
      .join(", ");
  if (!content) return null;

  return (
    <div
      data-slot="field-error"
      role="alert"
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
