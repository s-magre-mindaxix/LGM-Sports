import React, { useEffect, useState } from "react";
import {
  getProductPrices,
  deleteProductPrice,
  getProductPriceById,
} from "./Services/ProductPriceService";
import type {
  ProductPrice,
  ProductPriceListItem,
} from "./Services/types";
import ProductPriceWizard from "./ProductPriceWizard";
import ProductPriceViewModal from "./ProductPriceViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface DropdownOption {
  id: number;
  name: string;
}

const getArray = (response: any): any[] => {
  const result = response?.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;

  return [];
};

const mapOptions = (
  items: any[],
  type: "product" | "priceList"
): DropdownOption[] =>
  items
    .map((item) => {
      const id = Number(
        type === "product"
          ? item.productId ?? item.ProductId ?? item.id ?? item.Id
          : item.priceListId ??
              item.PriceListId ??
              item.id ??
              item.Id
      );

      const name =
        type === "product"
          ? item.productName ??
            item.ProductName ??
            item.name ??
            item.Name
          : item.priceListName ??
            item.PriceListName ??
            item.name ??
            item.Name;

      return { id, name: String(name ?? "") };
    })
    .filter(
      (item) =>
        Number.isInteger(item.id) &&
        item.id > 0 &&
        item.name.trim() !== ""
    );



const ProductPricePage: React.FC = () => {
  const [items, setItems] = useState<ProductPriceListItem[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [priceLists, setPriceLists] = useState<DropdownOption[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ProductPrice | null>(null);
  const [viewData, setViewData] = useState<ProductPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("ProductPrice", "CanAdd");
  const canEdit = hasPermission("ProductPrice", "CanEdit");
  const canDelete = hasPermission("ProductPrice", "CanDelete");

  const loadItems = async () => {
    setIsLoading(true);

    try {
      setItems(await getProductPrices());
    } catch (error) {
      console.error("Failed to load product prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load product and price-list names for display.
  useEffect(() => {
    let cancelled = false;

    const loadNames = async () => {
      try {
        const [productResponse, priceListResponse] = await Promise.all([
          apiClient.get(API_ENDPOINTS.Products || "/Products"),
          apiClient.get(API_ENDPOINTS.PriceList || "/PriceLists"),
        ]);

        if (cancelled) return;

        setProducts(mapOptions(getArray(productResponse), "product"));
        setPriceLists(mapOptions(getArray(priceListResponse), "priceList"));
      } catch (error) {
        console.error("Failed to load product/price-list names:", error);
      }
    };

    void loadNames();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();
    window.addEventListener("app-refresh", refresh);

    return () => {
      window.removeEventListener("app-refresh", refresh);
    };
  }, []);

  const productName = (id: number) =>
    products.find((item) => item.id === Number(id))?.name ??
    `Product #${id}`;

  const priceListName = (id: number) =>
    priceLists.find((item) => item.id === Number(id))?.name ??
    `Price List #${id}`;

  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      setViewData(await getProductPriceById(id));
    } catch (error) {
      console.error("Failed to load product price:", error);
      window.alert("Could not load product price details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      setEditData(await getProductPriceById(id));
      setShowWizard(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load product price for editing:", error);
      window.alert("Could not load product price for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product price?"
      )
    ) {
      return;
    }

    try {
      await deleteProductPrice(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete product price:", error);
      window.alert("Could not delete product price.");
    }
  };

  const columns: TableColumn<ProductPriceListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "Price List Name",
      cell: (row) => priceListName(row.priceListId),
      sortable: true,
      sortFunction: (a, b) =>
        priceListName(a.priceListId).localeCompare(
          priceListName(b.priceListId)
        ),
      grow: 1.3,
    },
    {
      name: "Product Name",
      cell: (row) => productName(row.productId),
      sortable: true,
      sortFunction: (a, b) =>
        productName(a.productId).localeCompare(productName(b.productId)),
      grow: 1.5,
    },
    {
      name: "Price Type",
      selector: (row) => row.priceType,
      sortable: true,
      grow: 1.2,
    },
    {
      name: "Amount",
      cell: (row) => Number(row.amount).toFixed(2),
      sortable: true,
      right: true,
      width: "125px",
    },
    {
      name: "Min Qty",
      selector: (row) => row.minQty,
      sortable: true,
      width: "95px",
    },
    {
      name: "Effective From",
      selector: (row) => row.effectiveFrom?.slice(0, 10) || "N/A",
      sortable: true,
      width: "140px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={
            row.isActive
              ? "rounded bg-green-100 px-2 py-1 text-green-700"
              : "rounded bg-gray-100 px-2 py-1 text-gray-600"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "105px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            title="View"
            onClick={() => void handleView(row.productPriceId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() => void handleEdit(row.productPriceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => void handleDelete(row.productPriceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = items.filter((item) => {
    const searchableText = [
      JSON.stringify(item),
      productName(item.productId),
      priceListName(item.priceListId),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(filterText.toLowerCase());
  });

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <ProductPriceWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            setEditData(null);
            void loadItems();
          }}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {viewData && (
        <ProductPriceViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Product Prices"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={
          canAdd
            ? () => {
                setEditData(null);
                setShowWizard(true);

                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            : undefined
        }
      />
    </div>
  );
};

export default ProductPricePage;