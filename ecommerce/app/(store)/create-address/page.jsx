import { redirect } from "next/navigation";

// Address management moved to the customer account
export default function CreateAddress() {
  redirect("/account/addresses");
}
