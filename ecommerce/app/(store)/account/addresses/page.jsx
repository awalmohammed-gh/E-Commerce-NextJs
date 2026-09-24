"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { AccountPageHeader } from "@/components/account/AccountShell";
import AddressCard, { AddressCardSkeleton } from "@/components/address/AddressCard";
import AddressModal from "@/components/modals/AddressModal";
import { EmptyState, ErrorState } from "@/components/ui/States";
import ConfirmDialog from "@/ui/ConfirmDialog";
import Toast from "@/ui/Toast";

export default function MyAddresses() {
  const router = useRouter();
  const { addresses, addressesLoading, addressesError, retryAddresses, deleteAddress, setDefaultAddress, isLoggedIn } =
    useEcommerce();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [pending, setPending] = useState({ id: null, action: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const showSuccess = (message) => setToast({ message, success: true, error: false });
  const showError = (message) => setToast({ message, success: false, error: true });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);
  const cancelDelete = useCallback(() => setConfirmDelete(null), []);

  const openNew = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const runAction = async (id, action, request, successMessage) => {
    if (pending.id) return; // no overlapping actions
    setPending({ id, action });
    const result = await request();
    setPending({ id: null, action: null });

    if (result.status === 401) {
      router.replace("/login?redirect=/account/addresses");
      return false;
    }
    if (result.success) showSuccess(successMessage);
    else showError(result.message);
    return result.success;
  };

  const handleSetDefault = (address) =>
    runAction(address._id, "default", () => setDefaultAddress(address._id), `${address.label} is now your default address.`);

  const handleConfirmDelete = async () => {
    const address = confirmDelete;
    if (!address) return;

    await runAction(
      address._id,
      "delete",
      () => deleteAddress(address._id),
      address.isDefault ? "Address deleted. Another address is now your default." : "Address deleted.",
    );
    setConfirmDelete(null);
  };

  const showSkeleton = addressesLoading || !isLoggedIn;

  return (
    <>
      <AccountPageHeader
        title="Addresses"
        description="Your default address is selected automatically at checkout."
        action={
          !showSkeleton &&
          !addressesError &&
          addresses.length > 0 && (
            <button type="button" onClick={openNew} className="btn-primary w-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add address
            </button>
          )
        }
      />

      {showSkeleton ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2" aria-busy="true" aria-label="Loading addresses">
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
      ) : addressesError ? (
        <ErrorState title="Your addresses didn't load." onRetry={retryAddresses} />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          message="Save an address once and checkout will fill it in for you."
          actionLabel="Add an address"
          onAction={openNew}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {addresses.map((address) => (
            <li key={address._id} className="flex">
              <div className="flex-1 [&>article]:h-full">
                <AddressCard
                  address={address}
                  pending={pending.id === address._id ? pending.action : null}
                  disabled={Boolean(pending.id) && pending.id !== address._id}
                  onEdit={() => openEdit(address)}
                  onDelete={() => setConfirmDelete(address)}
                  onSetDefault={() => handleSetDefault(address)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressModal open={modalOpen} editingAddress={editingAddress} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this address?"
        message={
          confirmDelete?.isDefault && addresses.length > 1
            ? "This is your default address. Another saved address will become your default."
            : "It will be removed from your saved addresses. Past orders keep their delivery details."
        }
        confirmText="Delete"
        cancelText="Keep it"
        loading={pending.action === "delete"}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />

      <div className="toast-region">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </>
  );
}
