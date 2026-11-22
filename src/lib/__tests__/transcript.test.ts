import { isHlsUrl } from "../transcript";

describe("isHlsUrl", () => {
  it("nhận diện đường dẫn HLS kể cả khi có query hoặc fragment", () => {
    expect(isHlsUrl("https://cdn.example.com/v/master.m3u8")).toBe(true);
    expect(isHlsUrl("https://cdn.example.com/v/master.M3U8?Policy=abc&Signature=xyz")).toBe(true);
    expect(isHlsUrl("https://cdn.example.com/v/master.m3u8#t=10")).toBe(true);
  });

  it("trả về false với nguồn không phải HLS hoặc rỗng", () => {
    expect(isHlsUrl("https://cdn.example.com/v/preview.mp4")).toBe(false);
    expect(isHlsUrl("https://cdn.example.com/v/preview.mp4?name=a.m3u8.txt")).toBe(false);
    expect(isHlsUrl("")).toBe(false);
  });
});
