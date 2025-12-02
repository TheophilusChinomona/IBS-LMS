"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
];

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              aria-label="Open navigation"
              onClick={onOpenSidebar}
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-subtle transition hover:border-primary/50 hover:text-primary xl:hidden"
            >
              <Menu className="size-5" />
            </button>
          )}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              IBS
            </span>{" "}
            LMS
          </Link>
        </div>
        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href as "/" | "/courses"}
              className={cn(
                "rounded-full px-3 py-1.5 transition hover:text-primary",
                isActive(item.href) && "bg-muted text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button
                variant="ghost"
                className="hidden text-sm font-semibold text-slate-600 hover:text-primary sm:inline-flex"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button
                className="text-sm"
                onClick={() => router.push("/register")}
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                className="hidden text-sm uppercase tracking-wide text-primary sm:inline-flex"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 transition hover:border-slate-200">
                  <Avatar name={user.name} className="h-10 w-10" />
                  <span className="hidden text-sm font-semibold text-slate-700 lg:inline">
                    {user.name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuLabel>
                    <div className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </div>
                    <p className="text-xs font-normal text-slate-500">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/certificates")}>
                    Certificates
                  </DropdownMenuItem>
                  {(user.role === "admin" ||
                    user.role === "instructor" ||
                    user.role === "superadmin") && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      Admin Workspace
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
