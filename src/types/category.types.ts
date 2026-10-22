export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
  status: CategoryStatus;
  createdAt?: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  status: CategoryStatus;
}
