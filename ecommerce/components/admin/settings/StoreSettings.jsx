import { Truck } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { NumberField, SettingsCard, TextField, Toggle } from "./SettingsFields";

const feeLabel = (fee) => (Number(fee) === 0 ? "Free delivery" : `${formatCurrency(fee)} per order`);
// Mid-sentence form: "GHS 30.00 per order" / "no delivery fee"
const feePhrase = (fee) => (Number(fee) === 0 ? "no delivery fee" : `${formatCurrency(fee)} per order`);

/*
  The flat delivery fee customers pay. Saved in AdminSettings.store and
  read by the cart and checkout on the server, so saving here changes
  the storefront straight away. Orders already placed keep their fee.
*/
function DeliveryFeeSetting({ value, savedValue, error, onChange }) {
  const raw = String(value ?? "").trim();
  const draftFee = Number(raw);
  const changed = raw !== "" && Number.isFinite(draftFee) && draftFee >= 0 && draftFee !== Number(savedValue);

  return (
    <section aria-labelledby="delivery-fee-title" className="rounded-md border border-line bg-paper p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-white">
          <Truck className="h-4 w-4 text-ink-soft" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 id="delivery-fee-title" className="text-sm font-semibold text-ink">
            Delivery fee
          </h3>
          <p className="mt-0.5 text-[13px] text-muted">
            One flat fee added to every order at checkout.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        <div className="rounded-md border border-line bg-white px-3.5 py-3">
          <p className="text-xs text-muted">Customers pay now</p>
          <p className="mt-1 text-lg font-semibold text-ink tabular-nums">
            {savedValue == null ? "—" : feeLabel(savedValue)}
          </p>
        </div>

        <NumberField
          id="store-deliveryFee"
          label="New delivery fee"
          suffix="GHS"
          min={0}
          max={10000}
          step="0.01"
          placeholder="e.g. 25"
          value={value}
          onChange={onChange}
          error={error}
          hint="Use 0 for free delivery. Up to 2 decimal places."
        />
      </div>

      {changed && (
        <p className="mt-3 rounded-md border border-warning/25 bg-warning-tint px-3 py-2 text-[13px] text-warning" role="status">
          After you save, new orders pay <span className="font-semibold">{feePhrase(draftFee)}</span> instead of{" "}
          {feePhrase(savedValue)}. Orders already placed keep the fee they were charged.
        </p>
      )}
    </section>
  );
}

export default function StoreSettings({ values, errors, onChange, saved, ...cardProps }) {
  const currency = values.currency || "GHS";

  return (
    <SettingsCard
      title="Store Configuration"
      description="Delivery, currency, tax and order limits for the whole store."
      {...cardProps}
    >
      <div className="space-y-4">
        <DeliveryFeeSetting
          value={values.deliveryFee}
          savedValue={saved?.deliveryFee}
          error={errors.deliveryFee}
          onChange={(v) => onChange("deliveryFee", v)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            id="store-currency"
            label="Currency code"
            value={values.currency}
            onChange={(v) => onChange("currency", v.toUpperCase())}
            error={errors.currency}
            maxLength={3}
            placeholder="GHS"
          />
          <TextField
            id="store-currencySymbol"
            label="Currency symbol"
            value={values.currencySymbol}
            onChange={(v) => onChange("currencySymbol", v)}
            error={errors.currencySymbol}
            maxLength={5}
            placeholder="GH₵"
          />
          <TextField
            id="store-country"
            label="Default country"
            value={values.country}
            onChange={(v) => onChange("country", v)}
            error={errors.country}
            placeholder="Ghana"
          />
        </div>

        <div className="border-t border-line">
          <Toggle
            id="store-taxEnabled"
            label="Charge tax"
            description="Add tax on top of the order subtotal at checkout."
            checked={values.taxEnabled}
            onChange={(v) => onChange("taxEnabled", v)}
            error={errors.taxEnabled}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField
            id="store-taxPercentage"
            label="Tax percentage"
            suffix="%"
            min={0}
            max={100}
            step="0.01"
            value={values.taxPercentage}
            onChange={(v) => onChange("taxPercentage", v)}
            error={errors.taxPercentage}
            disabled={!values.taxEnabled}
          />
          <NumberField
            id="store-minimumOrderAmount"
            label="Minimum order"
            suffix={currency}
            min={0}
            step="0.01"
            value={values.minimumOrderAmount}
            onChange={(v) => onChange("minimumOrderAmount", v)}
            error={errors.minimumOrderAmount}
            hint="0 for no minimum"
          />
          <NumberField
            id="store-maximumOrderAmount"
            label="Maximum order"
            suffix={currency}
            min={0}
            step="0.01"
            value={values.maximumOrderAmount}
            onChange={(v) => onChange("maximumOrderAmount", v)}
            error={errors.maximumOrderAmount}
            placeholder="No limit"
            hint="Leave empty for no limit"
          />
        </div>
      </div>
    </SettingsCard>
  );
}
