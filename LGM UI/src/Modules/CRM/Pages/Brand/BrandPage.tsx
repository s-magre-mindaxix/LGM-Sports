
import React, { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import type { TableColumn } from "react-data-table-component";
import { toast } from "sonner";

import {
    getBrands,
    getBrandById,
    deleteBrand,
} from "./Services/BrandServices";

import type { Brand } from "./Services/types";
import BrandWizard from "./BrandWizard";
import BrandViewModal from "./BrandViewModal";

import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const BrandPage: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [showWizard, setShowWizard] = useState(false);
    const [editData, setEditData] = useState<Brand | null>(null);
    const [viewData, setViewData] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filterText, setFilterText] = useState("");

    const { hasPermission } = usePermissions();

    const canAdd = hasPermission("Brand", "CanAdd");
    const canEdit = hasPermission("Brand", "CanEdit");
    const canDelete = hasPermission("Brand", "CanDelete");

    const loadBrands = async () => {
        try {
            setIsLoading(true);
            const result = await getBrands();
            setBrands(result);
        } catch (error) {
            console.error("Failed to load brands:", error);
            toast.error("Failed to load brands.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadBrands();
    }, []);

    const handleCreate = () => {
        setEditData(null);
        setShowWizard(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleView = async (id: number) => {
        try {
            const result = await getBrandById(id);
            setViewData(result);
        } catch (error) {
            console.error("Failed to load brand:", error);
            toast.error("Could not load brand details.");
        }
    };

    const handleEdit = async (id: number) => {
        try {
            setIsLoading(true);
            const result = await getBrandById(id);
            setEditData(result);
            setShowWizard(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Failed to load brand for editing:", error);
            toast.error("Could not load brand for editing.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this brand?")) {
            return;
        }

        try {
            await deleteBrand(id);
            toast.success("Brand deleted successfully.");
            await loadBrands();
        } catch (error: any) {
            console.error("Failed to delete brand:", error);
            toast.error(
                error?.response?.data?.message ||
                "Could not delete brand."
            );
        }
    };

    const handleSuccess = () => {
        setShowWizard(false);
        setEditData(null);
        void loadBrands();
    };

    const columns: TableColumn<Brand>[] = [
        {
            name: "Sr. No.",
            cell: (_row, index) => (index ?? 0) + 1,
            width: "80px",
        },
        {
            name: "Brand ID",
            selector: (row) => row.brandId,
            sortable: true,
            width: "110px",
        },
        {
            name: "Code",
            selector: (row) => row.code,
            sortable: true,
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description || "N/A",
            sortable: true,
            grow: 2,
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
            width: "110px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => void handleView(row.brandId)}
                        className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                        title="View"
                    >
                        <FaEye size={16} />
                    </button>

                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => void handleEdit(row.brandId)}
                            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                            title="Edit"
                        >
                            <FaEdit size={16} />
                        </button>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            onClick={() => void handleDelete(row.brandId)}
                            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                            title="Delete"
                        >
                            <FaTrash size={16} />
                        </button>
                    )}
                </div>
            ),
            width: "140px",
        },
    ];

    const filteredBrands = brands.filter((brand) =>
        `${brand.code} ${brand.name} ${brand.description}`
            .toLowerCase()
            .includes(filterText.toLowerCase())
    );

    return (
        <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
            {showWizard && (
                <BrandWizard
                    editData={editData}
                    onSuccess={handleSuccess}
                    onCancel={() => {
                        setShowWizard(false);
                        setEditData(null);
                    }}
                />
            )}

            {viewData && (
                <BrandViewModal
                    brand={viewData}
                    onClose={() => setViewData(null)}
                />
            )}

            <ListingLayout
                title="Listing of Brands"
                columns={columns}
                data={filteredBrands}
                isLoading={isLoading}
                filterText={filterText}
                onFilterChange={setFilterText}
                onCreate={canAdd ? handleCreate : undefined}
            />
        </div>
    );
};

export default BrandPage;
