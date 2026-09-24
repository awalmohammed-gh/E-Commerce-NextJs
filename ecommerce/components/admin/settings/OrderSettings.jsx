import { NumberField, SettingsCard, Toggle, ToggleList } from "./SettingsFields";

export default function OrderSettings({ values, errors, onChange, ...cardProps }) {
  return (
    <SettingsCard
      title="Order Settings"
      description="Control how customers place and cancel orders."
      {...cardProps}
    >
      <ToggleList>
        <Toggle
          id="orders-allowOrders"
          label="Accept new orders"
          description="Turn off to pause checkout, e.g. during stock-taking."
          checked={values.allowOrders}
          onChange={(v) => onChange("allowOrders", v)}
          error={errors.allowOrders}
        />
        <Toggle
          id="orders-requirePhone"
          label="Require phone number"
          description="Customers must give a phone number for delivery."
          checked={values.requirePhone}
          onChange={(v) => onChange("requirePhone", v)}
          error={errors.requirePhone}
        />
        <Toggle
          id="orders-requireAddress"
          label="Require delivery address"
          checked={values.requireAddress}
          onChange={(v) => onChange("requireAddress", v)}
          error={errors.requireAddress}
        />

        <div>
          <Toggle
            id="orders-allowCancellation"
            label="Allow order cancellation"
            description="Let customers cancel their own orders."
            checked={values.allowCancellation}
            onChange={(v) => onChange("allowCancellation", v)}
            error={errors.allowCancellation}
          />
          {values.allowCancellation && (
            <div className="pb-4 max-w-xs">
              <NumberField
                id="orders-cancellationTimeLimit"
                label="Cancellation window"
                suffix="hours"
                min={0}
                max={720}
                step="1"
                value={values.cancellationTimeLimit}
                onChange={(v) => onChange("cancellationTimeLimit", v)}
                error={errors.cancellationTimeLimit}
                hint="Time after ordering. 0 = until the order ships."
              />
            </div>
          )}
        </div>

        <div>
          <Toggle
            id="orders-autoCompleteOrders"
            label="Automatically complete orders"
            description="Mark shipped orders as Delivered after a set time."
            checked={values.autoCompleteOrders}
            onChange={(v) => onChange("autoCompleteOrders", v)}
            error={errors.autoCompleteOrders}
          />
          {values.autoCompleteOrders && (
            <div className="pb-4 max-w-xs">
              <NumberField
                id="orders-autoCompleteAfterDays"
                label="Complete after"
                suffix="days"
                min={1}
                max={90}
                step="1"
                value={values.autoCompleteAfterDays}
                onChange={(v) => onChange("autoCompleteAfterDays", v)}
                error={errors.autoCompleteAfterDays}
              />
            </div>
          )}
        </div>
      </ToggleList>
    </SettingsCard>
  );
}
