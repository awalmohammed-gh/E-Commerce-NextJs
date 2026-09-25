import { Users } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { Card, CardHeader, CardLink, CARD_X } from "@/components/admin/ui/Card";
import { EmptyState, Skeleton } from "@/components/admin/ui/States";
import Avatar from "@/components/admin/ui/Avatar";

export default function RecentUsers({ users = [], loading = false }) {
  return (
    <Card aria-labelledby="recent-customers-title">
      <CardHeader
        id="recent-customers-title"
        title="New customers"
        description="Latest sign-ups"
        action={<CardLink href="/admin/users">View all</CardLink>}
      />

      {loading ? (
        <div className={`${CARD_X} space-y-4 pb-4`}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState compact icon={Users} title="No customers yet" message="New sign-ups will appear here." />
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {users.map((user) => (
            <li key={user._id} className={`flex items-center gap-3 ${CARD_X} py-2.5`}>
              <Avatar name={user.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{user.fullName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <p className="shrink-0 text-xs whitespace-nowrap text-muted">{formatDate(user.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
