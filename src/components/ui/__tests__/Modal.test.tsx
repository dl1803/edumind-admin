import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal Component", () => {
  it("không render khi open = false", () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Tiêu đề">
        <p>Nội dung modal</p>
      </Modal>
    );
    expect(screen.queryByText("Nội dung modal")).not.toBeInTheDocument();
  });

  it("render khi open = true và đóng khi nhấn Escape", () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Tiêu đề">
        <p>Nội dung modal</p>
      </Modal>
    );

    expect(screen.getByText("Nội dung modal")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("gọi onClose khi click vào overlay", () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Tiêu đề">
        <p>Nội dung modal</p>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("không gọi onClose khi click bên trong panel nội dung", () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Tiêu đề">
        <p>Nội dung modal</p>
      </Modal>
    );

    const content = screen.getByText("Nội dung modal");
    fireEvent.click(content);
    expect(handleClose).not.toHaveBeenCalled();
  });
});
