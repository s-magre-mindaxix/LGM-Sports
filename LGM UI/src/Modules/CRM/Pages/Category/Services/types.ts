export interface Category {
  categoryId: number;
  code: string;
  categoryName: string;
  parentCategoryId: number | null;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface CategoryListItem extends Category {
  parentCategoryName?: string | null;
}

export interface CategoryParentOption {
  categoryId: number;
  code: string;
  categoryName: string;
}

