import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CategoryTable } from "../CategoryTable";
import { CategoryFormModal } from "../CategoryFormModal";
import { DeleteCategoryModal } from "../DeleteCategoryModal";
import { Category } from "@/types/category.types";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Lập trình Python",
    slug: "lap-trinh-python",
    description: "Khóa học Python căn bản",
    courseCount: 12,
    status: "ACTIVE",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Thiết kế UI/UX",
    slug: "thiet-ke-ui-ux",
    description: "Figma và Design System",
    courseCount: 0,
    status: "INACTIVE",
    createdAt: "2026-08-10T10:00:00.000Z",
  },
];

describe("CategoryTable Component", () => {
  it("render danh sách danh mục với các cột dữ liệu và ngày tạo", () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <CategoryTable
        categories={mockCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText("Lập trình Python")).toBeInTheDocument();
    expect(screen.getByText("12 khóa học")).toBeInTheDocument();
    expect(screen.getByText("01/08/2026")).toBeInTheDocument();

    expect(screen.getByText("Thiết kế UI/UX")).toBeInTheDocument();
    expect(screen.getByText("0 khóa học")).toBeInTheDocument();
    expect(screen.getByText("10/08/2026")).toBeInTheDocument();
  });

  it("gọi onEdit và onDelete khi tương tác nút bấm", () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <CategoryTable
        categories={mockCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const editBtns = screen.getAllByTitle("Chỉnh sửa danh mục");
    fireEvent.click(editBtns[0]);
    expect(handleEdit).toHaveBeenCalledWith(mockCategories[0]);

    const deleteBtns = screen.getAllByTitle("Xóa danh mục");
    fireEvent.click(deleteBtns[1]);
    expect(handleDelete).toHaveBeenCalledWith(mockCategories[1]);
  });

  it("hiển thị thông báo rỗng khi không có danh mục", () => {
    render(<CategoryTable categories={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Chưa có danh mục nào")).toBeInTheDocument();
  });

  it("hiển thị thông báo không tìm thấy phù hợp khi đang tìm kiếm", () => {
    const handleReset = jest.fn();
    render(
      <CategoryTable
        categories={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isSearching={true}
        onResetSearch={handleReset}
      />
    );

    expect(screen.getByText("Không tìm thấy danh mục nào phù hợp")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: "Xóa tìm kiếm" });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it("hiển thị footer phân trang động với số lượng và dropdown chọn dòng", () => {
    render(
      <CategoryTable
        categories={mockCategories}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByText("1 - 2")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/trong tổng số/i)).toBeInTheDocument();
    expect(screen.getByText("Dòng:")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("10");

    fireEvent.change(select, { target: { value: "5" } });
    expect(select).toHaveValue("5");
  });

  it("tự động kẹp an toàn số trang (safePage) và không bị vượt biên khi danh sách thu nhỏ", () => {
    const manyCategories: Category[] = Array.from({ length: 15 }, (_, i) => ({
      id: `cat-${i + 1}`,
      name: `Danh mục ${i + 1}`,
      slug: `danh-muc-${i + 1}`,
      courseCount: i,
      status: "ACTIVE",
      createdAt: "2026-08-01T08:00:00.000Z",
    }));

    const { rerender } = render(
      <CategoryTable
        categories={manyCategories}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    const page2Btn = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Btn);
    expect(screen.getByText("11 - 15")).toBeInTheDocument();

    rerender(
      <CategoryTable
        categories={mockCategories}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText("1 - 2")).toBeInTheDocument();
  });
});

describe("CategoryFormModal Component", () => {
  it("không hiển thị khi isOpen = false", () => {
    render(
      <CategoryFormModal
        isOpen={false}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.queryByText("Thêm danh mục mới")).not.toBeInTheDocument();
  });

  it("hiển thị tiêu đề Thêm danh mục mới khi tạo mới", () => {
    render(
      <CategoryFormModal
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText("Thêm danh mục mới")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập tên danh mục/i)).toBeInTheDocument();
  });

  it("tự động điền dữ liệu khi chỉnh sửa danh mục", () => {
    render(
      <CategoryFormModal
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        initialData={mockCategories[0]}
      />
    );

    expect(screen.getByText("Chỉnh sửa danh mục")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lập trình Python")).toBeInTheDocument();
    expect(screen.getByDisplayValue("lap-trinh-python")).toBeInTheDocument();
  });

  it("gọi onClose khi nhấn nút Hủy hoặc X", () => {
    const handleClose = jest.fn();
    render(
      <CategoryFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle("Đóng"));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it("gọi onClose khi nhấn phím Escape", () => {
    const handleClose = jest.fn();
    render(
      <CategoryFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("DeleteCategoryModal Component", () => {
  it("không hiển thị khi isOpen = false hoặc category = null", () => {
    render(
      <DeleteCategoryModal
        isOpen={false}
        category={null}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.queryByText("Không thể xóa danh mục")).not.toBeInTheDocument();
    expect(screen.queryByText("Xóa danh mục khóa học?")).not.toBeInTheDocument();
  });

  it("hiển thị cảnh báo chặn xóa khi danh mục có khóa học (courseCount > 0)", () => {
    const handleClose = jest.fn();
    render(
      <DeleteCategoryModal
        isOpen={true}
        category={mockCategories[0]} // courseCount = 12
        onClose={handleClose}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByText("Không thể xóa danh mục")).toBeInTheDocument();
    expect(screen.getByText("12 khóa học")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa vĩnh viễn" })).not.toBeInTheDocument();

    const understandBtn = screen.getByRole("button", { name: "Đã hiểu" });
    fireEvent.click(understandBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("hiển thị modal xác nhận xóa khi danh mục không có khóa học (courseCount === 0)", () => {
    const handleConfirm = jest.fn();
    render(
      <DeleteCategoryModal
        isOpen={true}
        category={mockCategories[1]} // courseCount = 0
        onClose={jest.fn()}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText("Xóa danh mục khóa học?")).toBeInTheDocument();
    const deleteBtn = screen.getByRole("button", { name: "Xóa vĩnh viễn" });
    fireEvent.click(deleteBtn);
    expect(handleConfirm).toHaveBeenCalledWith(mockCategories[1]);
  });

  it("gọi onClose khi nhấn phím Escape trên DeleteCategoryModal", () => {
    const handleClose = jest.fn();
    render(
      <DeleteCategoryModal
        isOpen={true}
        category={mockCategories[1]}
        onClose={handleClose}
        onConfirm={jest.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
