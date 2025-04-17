"use client"

import { toast as originalToast } from "@/components/ui/use-toast"
import type { Toast } from "@/components/ui/use-toast"

export function toast(props: Toast) {
  return originalToast({
    ...props,
    className:
      props.variant === "destructive"
        ? "bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800"
        : "bg-purple-50 border-purple-200 dark:bg-purple-900/50 dark:border-purple-800",
  })
}
