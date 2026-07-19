import { ApiClient, ApiClientError, createAdsApi, createAuthApi, createImagesApi } from "../../packages/api-client/src/index";
import type { AdvertisementStatus, OwnerAdvertisement, PublicAdvertisement } from "../../packages/shared-types/src/index";

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;
type PublicStatusIsActive = Expect<Equal<PublicAdvertisement["status"], "ACTIVE">>;
type OwnerStatusIsComplete = Expect<Equal<OwnerAdvertisement["status"], AdvertisementStatus>>;

describe("api client", () => {
  const fetchMock = jest.fn();
  const publicStatusContract: PublicStatusIsActive = true;
  const ownerStatusContract: OwnerStatusIsComplete = true;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: {} }),
    });
    global.fetch = fetchMock as never;
  });

  it("keeps public and owner advertisement status contracts distinct", () => {
    expect(publicStatusContract).toBe(true);
    expect(ownerStatusContract).toBe(true);
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

  it("uses typed current-profile and owner-ad endpoints with authentication", async () => {
    const client = new ApiClient({ baseUrl: "http://localhost:8080/api/v1", getToken: () => "test-token" });
    const authApi = createAuthApi(client);

    await authApi.me();
    await authApi.updateMe({ fullName: "Updated Owner", email: "owner@example.com", locationId: 2 });
    await authApi.myAds();

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:8080/api/v1/users/me",
      "http://localhost:8080/api/v1/users/me",
      "http://localhost:8080/api/v1/users/me/ads",
    ]);
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ fullName: "Updated Owner", email: "owner@example.com", locationId: 2 }),
    }));
    for (const [, init] of fetchMock.mock.calls) expect((init.headers as Headers).get("Authorization")).toBe("Bearer test-token");
  });

  it("preserves explicit nullable profile clears in the request body", async () => {
    const client = new ApiClient({ baseUrl: "http://localhost:8080/api/v1", getToken: () => "test-token" });
    await createAuthApi(client).updateMe({ email: null, locationId: null });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/users/me",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ email: null, locationId: null }) }),
    );
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
    const uploadData = [{ imageId: 9, adId: 5, imageUrl: "/uploads/image.jpg", thumbnailUrl: "/uploads/image.jpg", isMain: true }];
    fetchMock.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ success: true, data: uploadData }) });
    const client = new ApiClient({
      baseUrl: "http://localhost:8080/api/v1",
      getToken: () => "test-token",
    });
    const imagesApi = createImagesApi(client);
    const form = new FormData();
    form.append("files", new Blob(["image"]), "image.jpg");

    const response = await imagesApi.upload(5, form);

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
    expect(response.data).toEqual(uploadData);
  });

  it("surfaces only structured status and approved code for non-ok responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ code: "SESSION_EXPIRED", message: "secret-token Error at private.ts:1" }),
    });
    const client = new ApiClient({ baseUrl: "http://localhost:8080/api/v1" });

    const error = await client.request("/users/me").catch((reason: unknown) => reason) as ApiClientError;
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
    expect(error.message).not.toMatch(/secret-token|private\.ts/);
  });
});
