"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { AuthUser } from "@/lib/use-auth";

function getInitials(user: AuthUser): string {
  if (user.display_name) {
    return user.display_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email[0].toUpperCase();
}

export function UserMenu({
  user,
  onSignOut,
}: {
  user: AuthUser;
  onSignOut: () => void;
}) {
  const initials = getInitials(user);
  const label = user.display_name ?? user.email;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="User menu"
          className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold ring-1 ring-black/5 grid place-items-center hover:bg-neutral-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] bg-white ring-1 ring-black/5 rounded-xl shadow-md p-1 animate-in fade-in-0 zoom-in-95"
        >
          {/* User header */}
          <div className="px-3 py-2.5 border-b border-neutral-100 mb-1">
            <p className="text-sm font-medium text-neutral-900 truncate">{label}</p>
            {user.display_name && (
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            )}
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer outline-none"
            >
              Profile
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/profile#reviews"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 cursor-pointer outline-none"
            >
              My reviews
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="border-t border-neutral-100 my-1" />

          <DropdownMenu.Item
            onSelect={onSignOut}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer outline-none"
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
