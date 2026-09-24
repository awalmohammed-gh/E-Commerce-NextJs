import { Info } from "lucide-react";
import { SettingsCard, Toggle, ToggleList } from "./SettingsFields";

const NOTIFICATIONS = [
  {
    key: "newOrder",
    label: "New orders",
    description: "When a customer places an order.",
  },
  {
    key: "newUser",
    label: "New customers",
    description: "When someone creates an account.",
  },
  {
    key: "orderStatus",
    label: "Order status changes",
    description: "When an order is shipped, delivered or cancelled.",
  },
  {
    key: "payment",
    label: "Payments",
    description: "When an order is marked as paid.",
  },
];

export default function NotificationSettings({ values, errors, onChange, ...cardProps }) {
  return (
    <SettingsCard
      title="Notifications"
      description="Choose which store events you want to be notified about."
      {...cardProps}
    >
      <div className="mb-2 flex items-start gap-2 rounded-md border border-line bg-paper px-3.5 py-2.5 text-[13px] text-ink-soft">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        Preferences are saved now and will be used once email/SMS
        notifications are set up.
      </div>

      <ToggleList>
        {NOTIFICATIONS.map((n) => (
          <Toggle
            key={n.key}
            id={`notifications-${n.key}`}
            label={n.label}
            description={n.description}
            checked={values[n.key]}
            onChange={(v) => onChange(n.key, v)}
            error={errors[n.key]}
          />
        ))}
      </ToggleList>
    </SettingsCard>
  );
}
