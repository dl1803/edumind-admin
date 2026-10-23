import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoriesPage from "../page";
import { useCategoriesList, useSaveCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Category } from "@/types/category.types";

jest.mock("@/hooks/useCategories", () => ({
  useCategoriesList: jest.fn(),
  useSaveCategory: jest.fn(),
  useDeleteCategory: jest.fn(),
}));

jest.mock("@/context/TopBarContext", () => ({
  TopBarContent: ({ breadcrumb, actions }: { breadcrumb?: React.ReactNode; actions?: React.ReactNode }) => (
    <div data-testid="mock-topbar">
      <div data-testid="mock-breadcrumb">{breadcrumb}</div>
      <div data-testid="mock-actions">{actions}</div>
    </div>
  ),
}));

const mockUseCategoriesList = useCategoriesList as jest.Mock;
const mockUseSaveCategory = useSaveCategory as jest.Mock;
const mockUseDeleteCategory = useDeleteCategory as jest.Mock;

const sampleCategories: Category[] = [
  {
    id: "cat-1",
    name: "Lập trình Python",
    slug: "lap-trinh-python",
    description: "Cơ bản đến nâng cao",
    courseCount: 8,
    status: "ACTIVE",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Thiết kế UI/UX",
    slug: "thiet-ke-ui-ux",
    description: "Figma chuyên nghiệp",
    courseCount: 0,
    status: "ACTIVE",
    createdAt: "2026-08-10T10:00:00.000Z",
  },
];

describe("CategoriesPage (/categories Route)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveCategory.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUseDeleteCategory.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it("hiển thị danh sách danh mục khi tải xong dữ liệu", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    expect(screen.getByText("Quản lý danh mục")).toBeInTheDocument();
    expect(screen.getByText("Lập trình Python")).toBeInTheDocument();
    expect(screen.getByText("Thiết kế UI/UX")).toBeInTheDocument();
    expect(screen.getByText("8 khóa học")).toBeInTheDocument();
    expect(screen.getByText("0 khóa học")).toBeInTheDocument();
    expect(screen.getByText("01/08/2026")).toBeInTheDocument();
    expect(screen.getByText("10/08/2026")).toBeInTheDocument();
  });

  it("cho phép tìm kiếm danh mục theo từ khóa", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    const searchInput = screen.getByPlaceholderText("Tìm kiếm danh mục theo tên...");
    fireEvent.change(searchInput, { target: { value: "Python" } });

    expect(screen.getByText("Lập trình Python")).toBeInTheDocument();
    expect(screen.queryByText("Thiết kế UI/UX")).not.toBeInTheDocument();
  });

  it("hỗ trợ công cụ sắp xếp danh mục qua dropdown", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    expect(screen.getByText("Sắp xếp:")).toBeInTheDocument();
    const sortSelect = screen.getByTitle("Công cụ sắp xếp danh mục");
    expect(sortSelect).toBeInTheDocument();
    fireEvent.change(sortSelect, { target: { value: "name-asc" } });

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("mở modal tạo danh mục khi click nút Thêm danh mục", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    const createBtn = screen.getByRole("button", { name: "Thêm danh mục" });
    fireEvent.click(createBtn);

    expect(screen.getByText("Thêm danh mục mới")).toBeInTheDocument();
  });

  it("mở modal chỉnh sửa danh mục khi click nút Sửa", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    const editBtns = screen.getAllByTitle("Chỉnh sửa danh mục");
    fireEvent.click(editBtns[0]);

    expect(screen.getByText("Chỉnh sửa danh mục")).toBeInTheDocument();
  });

  it("mở modal xóa danh mục khi click nút Xóa", () => {
    mockUseCategoriesList.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });

    render(<CategoriesPage />);

    const deleteBtns = screen.getAllByTitle("Xóa danh mục");
    // Row 1 is cat-2 (0 courses) -> shows confirmation modal
    fireEvent.click(deleteBtns[0]);
    expect(screen.getByText("Xóa danh mục khóa học?")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));

    // Row 2 is cat-1 (8 courses) -> shows warning modal
    fireEvent.click(deleteBtns[1]);
    expect(screen.getByText("Không thể xóa danh mục")).toBeInTheDocument();
  });
});
