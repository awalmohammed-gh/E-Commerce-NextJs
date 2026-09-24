import Link from "next/link";
import { Users } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import {
  CARD_CLASS,
  EmptyState,
  SectionHeader,
  Skeleton,
} from "./DashboardStates";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function RecentUsers({ users = [], loading = false }) {
  return (
    <section className={`${CARD_CLASS} overflow-hidden`}>
      <SectionHeader
        title="Recent customers"
        subtitle="Latest registrations"
        action={
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-[#1C1A17] hover:text-[#D98880] underline underline-offset-4 transition-colors"
          >
            View all
          </Link>
        }
      />

      {loading ? (
        <div className="px-5 sm:px-6 pb-6 space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          message="New sign-ups will appear here."
        />
      ) : (
        <ul className="divide-y divide-[#1C1A17]/5 border-t border-[#1C1A17]/5">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center gap-3 px-5 sm:px-6 py-3.5"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#1C1A17] text-[#F5F1EA] flex items-center justify-center text-xs font-semibold">
                {initials(user.fullName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1C1A17] truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-[#8A6A52] truncate">{user.email}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4EE] border border-[#E5DDD1] text-[10px] font-semibold uppercase tracking-wider text-[#8A6A52]">
                  {user.role}
                </span>
                <p className="text-[11px] text-[#8A6A52] mt-1 whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
