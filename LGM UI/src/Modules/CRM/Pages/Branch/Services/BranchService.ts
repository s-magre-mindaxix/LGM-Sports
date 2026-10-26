import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { Branch, BranchListItem } from "../Services/types";

// Get all branches
export const getBranches = async (): Promise<BranchListItem[]> => {
    const res = await apiClient.get(API_ENDPOINTS.Branch);
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
};

// Generate a code from the first word of the branch name.
// Examples: "Pune Branch" -> PUNE001, "MindAxis Office" -> MINDA001.
export const getGeneratedBranchCode = async (
    branchName: string,
    excludeBranchId = 0,
): Promise<string> => {
    const firstWord = branchName
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

    if (!firstWord) return "";

    const prefix = firstWord
        .slice(0, firstWord.length <= 4 ? 4 : 5)
        .toUpperCase();

    const branches = await getBranches();
    const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

    const usedNumbers = branches
        .filter((branch) => branch.branchId !== excludeBranchId)
        .map((branch) => branch.branchCode?.match(codePattern))
        .filter((match): match is RegExpMatchArray => match !== null && match !== undefined)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number));

    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber += 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// Get branch by ID
export const getBranchById = async (id: number): Promise<Branch> => {
    const res = await apiClient.get(`${API_ENDPOINTS.Branch}/${id}`);
    return res.data;
};

// Create or update branch
export const saveBranch = async (data: Branch): Promise<void> => {
    const branchCode =
        data.branchId > 0
            ? data.branchCode
            : data.branchCode || await getGeneratedBranchCode(data.branchName);

    const payload = {
        branchId: data.branchId || 0,
        companyId: data.companyId,
        branchCode,
        branchName: data.branchName,
        address: data.address,
        contact: data.contact,
        isActive: data.isActive,
    };

    if (data.branchId > 0) {
        await apiClient.put(`${API_ENDPOINTS.Branch}/${data.branchId}`, payload);
    } else {
        await apiClient.post(API_ENDPOINTS.Branch, payload);
    }
};

// Delete branch
export const deleteBranch = async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.Branch}/${id}`);
};