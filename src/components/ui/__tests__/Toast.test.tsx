import * as React from "react";
import { render, screen, act } from "@testing-library/react";
import { ToastContainer } from "../Toast";
import { toast, useToastStore } from "@/hooks/useToast";

describe("Toast System", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => {
      useToastStore.setState({ toasts: [] });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("hiển thị toast và tự dismiss sau 5000ms", () => {
    render(<ToastContainer />);

    act(() => {
      toast.success("Thành công!");
    });

    expect(screen.getByText("Thành công!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Thành công!")).not.toBeInTheDocument();
  });

  it("giữ tối đa 5 toast khi push 6 toast liên tiếp", () => {
    render(<ToastContainer />);

    act(() => {
      toast.info("Toast 1");
      toast.info("Toast 2");
      toast.info("Toast 3");
      toast.info("Toast 4");
      toast.info("Toast 5");
      toast.info("Toast 6");
    });

    const items = screen.getAllByText(/Toast \d/);
    expect(items).toHaveLength(5);
    expect(screen.queryByText("Toast 1")).not.toBeInTheDocument();
    expect(screen.getByText("Toast 6")).toBeInTheDocument();
  });
});
