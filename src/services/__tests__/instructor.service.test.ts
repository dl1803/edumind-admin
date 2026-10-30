import { instructorService } from "../instructor.service";
import { resetMockInstructorsDb } from "../mock/instructor.mock";

describe("InstructorService", () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    resetMockInstructorsDb();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalEnv;
  });

  describe("getInstructors", () => {
    it("trả về danh sách giảng viên phân trang mặc định", async () => {
      const res = await instructorService.getInstructors();
      expect(res.items.length).toBe(5);
      expect(res.total).toBe(5);
      expect(res.page).toBe(1);
    });

    it("phân trang chính xác khi chỉ định pageSize nhỏ hơn tổng số", async () => {
      const res = await instructorService.getInstructors({ page: 1, pageSize: 2 });
      expect(res.items).toHaveLength(2);
      expect(res.total).toBe(5);
      expect(res.totalPages).toBe(3);
    });

    it("tìm kiếm chính xác theo họ tên giảng viên", async () => {
      const res = await instructorService.getInstructors({ search: "Lê Hoàng Nam" });
      expect(res.items.length).toBe(1);
      expect(res.items[0].fullName).toContain("Lê Hoàng Nam");
    });

    it("tìm kiếm chính xác theo chuyên môn hoặc email", async () => {
      const res = await instructorService.getInstructors({ search: "mai.nguyen@edumind.edu.vn" });
      expect(res.items.length).toBe(1);
      expect(res.items[0].email).toBe("mai.nguyen@edumind.edu.vn");
    });

    it("lọc danh sách giảng viên theo trạng thái đang cộng tác (active)", async () => {
      const res = await instructorService.getInstructors({ status: "active" });
      expect(res.items.length).toBe(4);
      expect(res.items.every((i) => i.isActive)).toBe(true);
    });

    it("lọc danh sách giảng viên theo trạng thái tạm ngưng (suspended)", async () => {
      const res = await instructorService.getInstructors({ status: "suspended" });
      expect(res.items.length).toBe(1);
      expect(res.items.every((i) => !i.isActive)).toBe(true);
    });

    it("lọc danh sách giảng viên theo chuyên môn (specialty: ai)", async () => {
      const res = await instructorService.getInstructors({ specialty: "ai" });
      expect(res.items.length).toBeGreaterThan(0);
      expect(
        res.items.every((i) => {
          const d = i.degree.toLowerCase();
          return d.includes("ai") || d.includes("trí tuệ") || d.includes("dữ liệu");
        })
      ).toBe(true);
    });

    it("sắp xếp theo số khóa dạy giảm dần và tăng dần", async () => {
      const resDesc = await instructorService.getInstructors({
        sortBy: "courseCount",
        sortDir: "desc",
      });
      for (let i = 0; i < resDesc.items.length - 1; i++) {
        expect(resDesc.items[i].courseCount).toBeGreaterThanOrEqual(
          resDesc.items[i + 1].courseCount
        );
      }

      const resAsc = await instructorService.getInstructors({
        sortBy: "courseCount",
        sortDir: "asc",
      });
      for (let i = 0; i < resAsc.items.length - 1; i++) {
        expect(resAsc.items[i].courseCount).toBeLessThanOrEqual(
          resAsc.items[i + 1].courseCount
        );
      }
    });
  });

  describe("getInstructorStats", () => {
    it("tính toán đúng các số liệu thống kê tổng hợp", async () => {
      const stats = await instructorService.getInstructorStats();
      expect(stats.total).toBe(5);
      expect(stats.activeCount).toBe(4);
      expect(stats.suspendedCount).toBe(1);
      expect(stats.totalCourses).toBe(10);
    });
  });

  describe("deleteInstructor (Quy tắc BR-17)", () => {
    it("chặn xóa giảng viên đang phụ trách khóa học (courseCount > 0)", async () => {
      await expect(instructorService.deleteInstructor("GV-2026-0001")).rejects.toThrow(
        "Không thể xóa giảng viên đang phụ trách khóa học"
      );
    });

    it("cho phép xóa giảng viên khi số khóa dạy bằng 0 (courseCount === 0)", async () => {
      const res = await instructorService.deleteInstructor("GV-2026-0005");
      expect(res.message).toContain("thành công");

      const afterDelete = await instructorService.getInstructors();
      expect(afterDelete.items.find((i) => i.id === "GV-2026-0005")).toBeUndefined();
      expect(afterDelete.total).toBe(4);
    });

    it("báo lỗi khi xóa giảng viên có ID không tồn tại", async () => {
      await expect(instructorService.deleteInstructor("NON-EXISTENT")).rejects.toThrow(
        "Không tìm thấy thông tin giảng viên"
      );
    });
  });

  describe("updateInstructorStatus", () => {
    it("tạm dừng cộng tác giảng viên thành công (isActive: false)", async () => {
      const updated = await instructorService.updateInstructorStatus("GV-2026-0001", false);
      expect(updated.isActive).toBe(false);

      const checkList = await instructorService.getInstructors({ status: "suspended" });
      expect(checkList.items.some((i) => i.id === "GV-2026-0001")).toBe(true);
    });

    it("kích hoạt lại cộng tác giảng viên thành công (isActive: true)", async () => {
      const updated = await instructorService.updateInstructorStatus("GV-2026-0004", true);
      expect(updated.isActive).toBe(true);

      const checkList = await instructorService.getInstructors({ status: "active" });
      expect(checkList.items.some((i) => i.id === "GV-2026-0004")).toBe(true);
    });

    it("báo lỗi khi cập nhật trạng thái giảng viên không tồn tại", async () => {
      await expect(
        instructorService.updateInstructorStatus("NON-EXISTENT", true)
      ).rejects.toThrow("Không tìm thấy thông tin giảng viên");
    });
  });
});
