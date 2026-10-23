import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategorySortDropdown } from "../CategorySortDropdown";

describe("CategorySortDropdown Component", () => {
  it("render cụm sắp xếp với nhãn Sắp xếp: và select box", () => {
    const handleSelect = jest.fn();
    render(
      <CategorySortDropdown
        sortKey="createdAt"
        sortDir="desc"
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText("Sắp xếp:")).toBeInTheDocument();
    const select = screen.getByTitle("Công cụ sắp xếp danh mục") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("createdAt-desc");
  });

  it("gọi onSelect khi thay đổi tiêu chí sắp xếp", () => {
    const handleSelect = jest.fn();
    render(
      <CategorySortDropdown
        sortKey="createdAt"
        sortDir="desc"
        onSelect={handleSelect}
      />
    );

    const select = screen.getByTitle("Công cụ sắp xếp danh mục");
    fireEvent.change(select, { target: { value: "name-asc" } });

    expect(handleSelect).toHaveBeenCalledWith("name", "asc");
  });
});
