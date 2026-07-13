import { ApiClient, createAdsApi, createAuthApi, createImagesApi } from "../../packages/api-client/src/index";

describe("api client", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: {} }),
    });
    global.fetch = fetchMock as never;
  });

  it("adds JSON content type and bearer token for normal requests", async () => {
    const client = new ApiClient({
      baseUrl: "http://localhost:8080/api/v1",
      getToken: () => "test-token",
    });
    const authApi = createAuthApi(client);

    await authApi.changePassword({ currentPassword: "password123", newPassword: "password1234" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/change-password",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ currentPassword: "password123", newPassword: "password1234" }),
        headers: expect.any(Headers),
      }),
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("uses documented ad endpoints and query strings", async () => {
    const client = new ApiClient({ baseUrl: "http://localhost:8080/api/v1" });
    const adsApi = createAdsApi(client);

    await adsApi.list("?page=2&size=5");
    await adsApi.updateStatus(10, "SOLD");

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/v1/ads?page=2&size=5");
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8080/api/v1/ads/10/status");
    expect(fetchMock.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "SOLD" }),
      }),
    );
  });

  it("does not set JSON content type for FormData uploads", async () => {
    const client = new ApiClient({
      baseUrl: "http://localhost:8080/api/v1",
      getToken: () => "test-token",
    });
    const imagesApi = createImagesApi(client);
    const form = new FormData();
    form.append("files", new Blob(["image"]), "image.jpg");

    await imagesApi.upload(5, form);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/ads/5/images",
      expect.objectContaining({
        method: "POST",
        body: form,
        headers: expect.any(Headers),
      }),
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("surfaces non-ok responses with response text", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue("Unauthorized"),
    });
    const client = new ApiClient({ baseUrl: "http://localhost:8080/api/v1" });

    await expect(client.request("/users/me")).rejects.toThrow("API request failed: 401 Unauthorized");
  });
});
