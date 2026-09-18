import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

/**
 * Breadcrumb Component สำหรับนำทางตามลำดับชั้นหน้าจอ
 */
export function Breadcrumb({ items, homeHref = "/", className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-muted-foreground mb-4 overflow-x-auto py-1 ${className}`}
    >
      <Link
        href={homeHref}
        className="hover:text-foreground flex items-center gap-1 shrink-0 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">หน้าหลัก</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
          {item.href && idx < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground truncate transition-colors max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-foreground truncate max-w-[250px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
