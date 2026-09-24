"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Button from "@/components/admin/ui/Button";
import { useToast } from "@/components/admin/ui/Toast";
import ProductForm from "@/components/admin/products/ProductForm";

export default function AddProduct() {
  const router = useRouter();
  const toast = useToast();

  const createProduct = async (formData) => {
    const res = await fetch("/api/add-product", { method: "POST", body: formData });

    if (res.status === 401 || res.status === 403) {
      router.replace("/admin/admin-login");
      return null;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        res.status === 400 && data?.message
          ? `${data.message}.`
          : "The product couldn't be saved. Your details are still here, so you can try again.",
      );
    }

    toast.success(`"${formData.get("name")}" was added to your catalog.`);
    return data?.product;
  };

  return (
    <>
      <PageHeader
        title="Add product"
        description="New products go live in the store as soon as they're saved."
        actions={
          <Button variant="ghost" icon={ArrowLeft} href="/admin/list">
            Back to products
          </Button>
        }
      />
      <ProductForm mode="create" onSubmit={createProduct} />
    </>
  );
}
