import { redirect } from "next/navigation";
import CoursesCategoriesPage from "../page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("CoursesCategoriesPage (/courses/categories Route)", () => {
  it("chuyển hướng người dùng về /categories", () => {
    CoursesCategoriesPage();
    expect(redirect).toHaveBeenCalledWith("/categories");
  });
});
