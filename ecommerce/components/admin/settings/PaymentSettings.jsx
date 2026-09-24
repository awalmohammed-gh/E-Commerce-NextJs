import { AlertCircle } from "lucide-react";
import { SettingsCard, Toggle, ToggleList } from "./SettingsFields";

// Matches the paymentMethod values accepted by checkout
const METHODS = [
  {
    key: "cashOnDelivery",
    label: "Cash on Delivery",
    description: "Customer pays when the order arrives.",
  },
  {
    key: "mobileMoney",
    label: "Mobile Money",
    description: "MTN MoMo, Telecel Cash, AirtelTigo Money.",
  },
  {
    key: "card",
    label: "Card",
    description: "Debit and credit card payments.",
  },
];

export default function PaymentSettings({ values, errors, onChange, ...cardProps }) {
  const enabledCount = METHODS.filter((m) => values[m.key]).length;
  const sectionError = errors._section;

  return (
    <SettingsCard
      title="Payment Methods"
      description="Choose which payment options customers see at checkout."
      {...cardProps}
    >
      {sectionError && (
        <div className="mb-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {sectionError}
        </div>
      )}

      <ToggleList>
        {METHODS.map((method) => {
          const isLastEnabled = values[method.key] && enabledCount === 1;

          return (
            <Toggle
              key={method.key}
              id={`payments-${method.key}`}
              label={method.label}
              description={
                isLastEnabled
                  ? "At least one payment method must stay enabled."
                  : method.description
              }
              checked={values[method.key]}
              onChange={(v) => onChange(method.key, v)}
              disabled={isLastEnabled}
              error={errors[method.key]}
            />
          );
        })}
      </ToggleList>
    </SettingsCard>
  );
}
