import { NumberField, SettingsCard, TextField, Toggle } from "./SettingsFields";

export default function StoreSettings({ values, errors, onChange, ...cardProps }) {
  const currency = values.currency || "GHS";

  return (
    <SettingsCard
      title="Store Configuration"
      description="Currency, location, tax and order limits for the whole store."
      {...cardProps}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

        <div className="border-t border-[#1C1A17]/5">
          <Toggle
            id="store-taxEnabled"
            label="Charge tax"
            description="Add tax on top of the order subtotal at checkout."
            checked={values.taxEnabled}
            onChange={(v) => onChange("taxEnabled", v)}
            error={errors.taxEnabled}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
