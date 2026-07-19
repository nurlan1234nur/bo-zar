import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  me: vi.fn(), updateMe: vi.fn(), myAds: vi.fn(), logout: vi.fn(), login: vi.fn(), register: vi.fn(),
  listAds: vi.fn(), createAd: vi.fn(), upload: vi.fn(), categories: vi.fn(), locations: vi.fn(), favorites: vi.fn(),
}));

class MockApiClientError extends Error {
  constructor(public readonly status: number, public readonly code?: string) {
    super(`API request failed with status ${status}`);
  }
}

vi.mock("@bozar/api-client", () => ({
  ApiClient: class { constructor() {} },
  ApiClientError: MockApiClientError,
  createAuthApi: () => ({ me: api.me, updateMe: api.updateMe, myAds: api.myAds, logout: api.logout, login: api.login, register: api.register }),
  createAdsApi: () => ({ list: api.listAds, create: api.createAd, detail: vi.fn() }),
  createCatalogApi: () => ({ categories: api.categories, locations: api.locations, subcategories: vi.fn().mockResolvedValue({ data: { items: [] } }) }),
  createFavoritesApi: () => ({ list: api.favorites, add: vi.fn(), remove: vi.fn() }),
  createImagesApi: () => ({ upload: api.upload }),
  createReportsApi: () => ({ create: vi.fn() }),
}));

const storedSession = { token: "stored-token", user: { userId: 7, fullName: "Stored Owner", phone: "99112233" } };
const serverProfile = { userId: 7, fullName: "Server Owner", phone: "99112233", email: "server@example.com", role: "USER", status: "ACTIVE", locationId: 1, locationName: "Ulaanbaatar", profileImage: null };
const nextProfile = { ...serverProfile, userId: 8, fullName: "Next Owner", email: null };
const nextSession = { token: "next-token", user: nextProfile };
const nextAd = { adId: 80, title: "Next private ad", description: "next owner data", categoryId: 1, locationId: 1, locationName: "Ulaanbaatar", sellerName: "Next Owner", contactPhone: "88112233", imageUrl: "", viewCount: 0, createdAt: "2026-07-15T00:00:00.000Z", status: "ACTIVE" };
const publicAd = (adId: number, title: string) => ({ adId, title, description: "Public ad", price: 100, status: "ACTIVE", categoryId: 1, locationId: 1, locationName: "Ulaanbaatar", sellerName: "Seller", contactPhone: "99112233", imageUrl: "", viewCount: 0, createdAt: "2026-07-15T00:00:00.000Z" });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

async function resolveDeferred<T>(request: ReturnType<typeof deferred<T>>, value: T) {
  await act(async () => {
    request.resolve(value);
    await request.promise;
  });
}

async function rejectDeferred<T>(request: ReturnType<typeof deferred<T>>, reason: unknown) {
  await act(async () => {
    request.reject(reason);
    await request.promise.catch(() => undefined);
  });
}

async function loginAsNextOwner() {
  api.login.mockResolvedValueOnce({ data: nextSession });
  fireEvent.click(screen.getByTitle("Нэвтрэх"));
  fireEvent.change(screen.getByLabelText("Утас эсвэл и-мэйл"), { target: { value: "next@example.com" } });
  const password = screen.getByLabelText("Нууц үг");
  fireEvent.change(password, { target: { value: "password123" } });
  fireEvent.submit(password.closest("form")!);
  await screen.findByText("Next Owner");
}

async function establishNextOwnerAccount() {
  api.me.mockResolvedValue({ data: nextProfile });
  api.myAds.mockResolvedValue({ data: [nextAd] });
  fireEvent.click(screen.getByText("Next Owner"));
  expect(await screen.findByRole("heading", { name: "Миний зарууд" })).toBeInTheDocument();
  expect(await screen.findByText("Next private ad")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
}

async function renderApp(session?: typeof storedSession) {
  vi.resetModules();
  if (session) localStorage.setItem("bozar.web.session", JSON.stringify(session));
  const { App } = await import("./main");
  return render(<App />);
}

async function submitCreate(files: File[] = []) {
  fireEvent.click(screen.getByRole("button", { name: /Зар нэмэх/ }));
  const dialog = await screen.findByRole("heading", { name: "Зар нэмэх" });
  const form = dialog.closest("form")!;
  fireEvent.change(screen.getByLabelText("Гарчиг"), { target: { value: "Created advertisement" } });
  fireEvent.change(screen.getByLabelText("Тайлбар"), { target: { value: "A sufficiently detailed advertisement" } });
  if (files.length > 0) fireEvent.change(screen.getByLabelText("Зураг"), { target: { files } });
  fireEvent.submit(form);
}

function sizedImage(name: string, size: number, type = "image/jpeg") {
  const file = new File(["image"], name, { type });
  Object.defineProperty(file, "size", { configurable: true, value: size });
  return file;
}

describe("public web account workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.me.mockResolvedValue({ data: serverProfile });
    api.myAds.mockResolvedValue({ data: [] });
    api.logout.mockResolvedValue({ data: undefined });
    api.listAds.mockResolvedValue({ data: { items: [], meta: { page: 1, size: 12, total: 0, totalPages: 1 } } });
    api.categories.mockResolvedValue({ data: [] });
    api.locations.mockResolvedValue({ data: [{ locationId: 1, name: "Ulaanbaatar", type: "city" }] });
    api.favorites.mockResolvedValue({ data: [] });
    api.createAd.mockResolvedValue({ data: { adId: 55 } });
    api.upload.mockResolvedValue({ data: [{ imageId: 5, adId: 55, imageUrl: "/uploads/server.jpg", thumbnailUrl: "/uploads/server.jpg", isMain: true }] });
  });

  it("opens login for a guest Account action", async () => {
    await renderApp();
    fireEvent.click(screen.getByTitle("Нэвтрэх"));
    expect(await screen.findByRole("heading", { name: "Нэвтрэх" })).toBeInTheDocument();
  });

  it("does not request owner data while stored-session restoration is pending", async () => {
    let finish!: (value: unknown) => void;
    api.me.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    await renderApp(storedSession);
    expect(screen.getByTitle("Нэвтрэх")).toBeInTheDocument();
    expect(api.myAds).not.toHaveBeenCalled();
    finish({ data: serverProfile });
    await screen.findByText("Server Owner");
    expect(api.myAds).not.toHaveBeenCalled();
  });

  it("refreshes a valid session from the server and opens Account", async () => {
    await renderApp(storedSession);
    await waitFor(() => expect(screen.getByText("Server Owner")).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject(serverProfile);
    fireEvent.click(screen.getByText("Server Owner"));
    expect(await screen.findByRole("heading", { name: "Миний зарууд" })).toBeInTheDocument();
    expect(api.myAds).toHaveBeenCalledOnce();
  });

  it("clears an invalid stored session without requesting owner data", async () => {
    api.me.mockRejectedValueOnce(new MockApiClientError(401));
    await renderApp(storedSession);
    await waitFor(() => expect(localStorage.getItem("bozar.web.session")).toBeNull());
    expect(api.myAds).not.toHaveBeenCalled();
    expect(screen.getByTitle("Нэвтрэх")).toBeInTheDocument();
  });

  it("updates profile session storage and clears all authenticated state on logout", async () => {
    const updated = { ...serverProfile, fullName: "Updated Owner" };
    api.updateMe.mockResolvedValue({ data: updated });
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    const name = await screen.findByLabelText("Бүтэн нэр");
    fireEvent.change(name, { target: { value: "Updated Owner" } });
    fireEvent.click(screen.getByRole("button", { name: "Профайл хадгалах" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user.fullName).toBe("Updated Owner"));
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    expect(localStorage.getItem("bozar.web.session")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Миний зарууд" })).not.toBeInTheDocument();
  });

  it("ignores an initial restoration result after a newer login", async () => {
    const restore = deferred<{ data: typeof serverProfile }>();
    api.me.mockImplementationOnce(() => restore.promise);
    await renderApp(storedSession);
    await loginAsNextOwner();
    await establishNextOwnerAccount();
    await resolveDeferred(restore, { data: serverProfile });
    expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
    expect(screen.getByText("Next private ad")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject({ userId: 8, fullName: "Next Owner" });
    expect(screen.queryByText("Server Owner")).not.toBeInTheDocument();
  });

  it("ignores pending owner success after logout and a different login", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const oldProfile = deferred<{ data: typeof serverProfile }>();
    const oldAds = deferred<{ data: Array<Record<string, unknown>> }>();
    api.me.mockImplementationOnce(() => oldProfile.promise);
    api.myAds.mockImplementationOnce(() => oldAds.promise);
    fireEvent.click(screen.getByText("Server Owner"));
    await screen.findByRole("heading", { name: "Миний зарууд" });
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    await loginAsNextOwner();
    await establishNextOwnerAccount();
    await act(async () => {
      oldProfile.resolve({ data: serverProfile });
      oldAds.resolve({ data: [{ adId: 99, title: "Old private ad" }] });
      await Promise.all([oldProfile.promise, oldAds.promise]);
    });
    expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
    expect(screen.getByText("Next private ad")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject({ userId: 8, fullName: "Next Owner" });
    expect(screen.queryByText("Old private ad")).not.toBeInTheDocument();
    expect(screen.queryByText("Server Owner")).not.toBeInTheDocument();
  });

  it("ignores an old owner 401 after a different login", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const oldProfile = deferred<{ data: typeof serverProfile }>();
    api.me.mockImplementationOnce(() => oldProfile.promise);
    api.myAds.mockImplementationOnce(() => new Promise(() => undefined));
    fireEvent.click(screen.getByText("Server Owner"));
    await screen.findByRole("heading", { name: "Миний зарууд" });
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    await loginAsNextOwner();
    await establishNextOwnerAccount();
    await rejectDeferred(oldProfile, new MockApiClientError(401));
    expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
    expect(screen.getByText("Next private ad")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!)).toMatchObject({ token: "next-token", user: { userId: 8 } });
    expect(screen.queryByTitle("Нэвтрэх")).not.toBeInTheDocument();
  });

  it("ignores a stale profile-save success after logout and re-login", async () => {
    const save = deferred<{ data: typeof serverProfile }>();
    api.updateMe.mockImplementationOnce(() => save.promise);
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    fireEvent.submit((await screen.findByLabelText("Бүтэн нэр")).closest("form")!);
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    await loginAsNextOwner();
    await establishNextOwnerAccount();
    await resolveDeferred(save, { data: { ...serverProfile, fullName: "Stale Saved Owner" } });
    expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
    expect(screen.getByText("Next private ad")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject({ userId: 8, fullName: "Next Owner" });
    expect(screen.queryByText("Stale Saved Owner")).not.toBeInTheDocument();
  });

  it("ignores stale profile-save failure/finally and deduplicates rapid owner retry", async () => {
    const oldSave = deferred<{ data: typeof serverProfile }>();
    const newSave = deferred<{ data: typeof nextProfile }>();
    api.updateMe.mockImplementationOnce(() => oldSave.promise).mockImplementationOnce(() => newSave.promise);
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    fireEvent.submit((await screen.findByLabelText("Бүтэн нэр")).closest("form")!);
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    await loginAsNextOwner();
    await establishNextOwnerAccount();
    fireEvent.change(screen.getByLabelText("Бүтэн нэр"), { target: { value: "Newest Owner" } });
    fireEvent.submit(screen.getByLabelText("Бүтэн нэр").closest("form")!);
    expect(screen.getByRole("button", { name: "Хадгалж байна…" })).toBeDisabled();

    await rejectDeferred(oldSave, new Error("old save failed"));
    expect(screen.getByRole("button", { name: "Хадгалж байна…" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Next Owner" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject({ userId: 8, fullName: "Next Owner" });
    expect(screen.queryByText("old save failed")).not.toBeInTheDocument();

    await resolveDeferred(newSave, { data: { ...nextProfile, fullName: "Newest Owner" } });
    expect(screen.getByRole("heading", { name: "Newest Owner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Профайл хадгалах" })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem("bozar.web.session")!).user).toMatchObject({ userId: 8, fullName: "Newest Owner" });

    api.me.mockRejectedValueOnce(new Error("Network error"));
    fireEvent.click(screen.getByRole("button", { name: /Зар үзэх/ }));
    fireEvent.click(screen.getByText("Newest Owner"));
    const retry = await screen.findByRole("button", { name: /Дахин оролдох/ });
    const before = api.myAds.mock.calls.length;
    fireEvent.click(retry);
    fireEvent.click(retry);
    await waitFor(() => expect(api.myAds.mock.calls.length).toBe(before + 1));
  });

  it("renders only a safe fallback for Account loading failures", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    api.me.mockRejectedValueOnce(new Error('{"token":"secret-token","stack":"Error at private.ts:1"}'));
    fireEvent.click(screen.getByText("Server Owner"));
    expect(await screen.findByText("Профайл болон заруудыг ачаалж чадсангүй.")).toBeInTheDocument();
    expect(screen.queryByText(/secret-token|private\.ts|"stack"/i)).not.toBeInTheDocument();
  });

  it("renders only a safe fallback for profile-save failures", async () => {
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    await screen.findByLabelText("Бүтэн нэр");
    api.updateMe.mockRejectedValueOnce(new Error('{"token":"secret-token","stack":"Error at private.ts:1"}'));
    fireEvent.submit(screen.getByLabelText("Бүтэн нэр").closest("form")!);
    expect(await screen.findByText("Профайл хадгалах үед алдаа гарлаа.")).toBeInTheDocument();
    expect(screen.queryByText(/secret-token|private\.ts|"stack"/i)).not.toBeInTheDocument();
  });

  it("ignores an old favorites success after the next user's favorites are established", async () => {
    const oldFavorites = deferred<{ data: Array<ReturnType<typeof publicAd>> }>();
    api.favorites.mockImplementationOnce(() => oldFavorites.promise);
    api.listAds.mockResolvedValue({ data: { items: [publicAd(1, "Old favorite"), publicAd(2, "New favorite")], meta: { page: 1, size: 12, total: 2, totalPages: 1 } } });
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    api.favorites.mockResolvedValueOnce({ data: [publicAd(2, "New favorite")] });
    await loginAsNextOwner();
    const newFavoriteButton = (await screen.findByText("New favorite")).closest("article")!.querySelector('button[title="Favorite"]')!;
    const oldFavoriteButton = screen.getByText("Old favorite").closest("article")!.querySelector('button[title="Favorite"]')!;
    await waitFor(() => expect(newFavoriteButton).toHaveClass("is-favorite"));
    expect(oldFavoriteButton).not.toHaveClass("is-favorite");

    await resolveDeferred(oldFavorites, { data: [publicAd(1, "Old favorite")] });
    expect(newFavoriteButton).toHaveClass("is-favorite");
    expect(oldFavoriteButton).not.toHaveClass("is-favorite");
  });

  it("ignores an old favorites failure after the next user's favorites are established", async () => {
    const oldFavorites = deferred<{ data: Array<ReturnType<typeof publicAd>> }>();
    api.favorites.mockImplementationOnce(() => oldFavorites.promise);
    api.listAds.mockResolvedValue({ data: { items: [publicAd(2, "New favorite")], meta: { page: 1, size: 12, total: 1, totalPages: 1 } } });
    await renderApp(storedSession);
    fireEvent.click(await screen.findByText("Server Owner"));
    fireEvent.click(screen.getByRole("button", { name: /Гарах/ }));
    api.favorites.mockResolvedValueOnce({ data: [publicAd(2, "New favorite")] });
    await loginAsNextOwner();
    const newFavoriteButton = (await screen.findByText("New favorite")).closest("article")!.querySelector('button[title="Favorite"]')!;
    await waitFor(() => expect(newFavoriteButton).toHaveClass("is-favorite"));

    await rejectDeferred(oldFavorites, new Error("secret-token Error at private.ts:1"));
    expect(newFavoriteButton).toHaveClass("is-favorite");
    expect(screen.queryByText("Favorite татахад backend алдаа өглөө")).not.toBeInTheDocument();
    expect(screen.queryByText(/secret-token|private\.ts/i)).not.toBeInTheDocument();
  });

  it("reports truthful create success when no image is selected", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate();
    expect(await screen.findByText("Зар амжилттай нэмэгдлээ")).toBeInTheDocument();
    expect(api.upload).not.toHaveBeenCalled();
    expect(await screen.findByText("Created advertisement")).toBeInTheDocument();
  });

  it("uses the persistent server image URL after create and upload succeed", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "photo.jpg", { type: "image/jpeg" });
    await submitCreate([file]);
    expect(await screen.findByText("Зар болон зураг амжилттай нэмэгдлээ")).toBeInTheDocument();
    expect(api.upload).toHaveBeenCalledWith(55, [file]);
    expect(await screen.findByRole("img", { name: "Created advertisement" })).toHaveAttribute("src", "http://localhost:8080/uploads/server.jpg");
  });

  it("keeps the created ad but drops previews and sanitizes upload failures", async () => {
    api.upload.mockRejectedValueOnce(new Error("API request failed: 415 secret-token stack trace"));
    const objectUrl = vi.spyOn(URL, "createObjectURL");
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const file = new File(["not-an-image"], "photo.jpg", { type: "image/jpeg" });
    await submitCreate([file]);
    expect(await screen.findByText("Зар нэмэгдсэн боловч зураг upload амжилтгүй боллоо")).toBeInTheDocument();
    expect(await screen.findByText("Created advertisement")).toBeInTheDocument();
    expect(screen.queryByText(/secret-token|stack trace/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Created advertisement" })).not.toBeInTheDocument();
    expect(objectUrl).not.toHaveBeenCalled();
    objectUrl.mockRestore();
  });

  it("accepts the exact 5 MB boundary and all eight allowed files", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const files = [sizedImage("boundary.jpg", 5 * 1024 * 1024), ...Array.from({ length: 7 }, (_, index) => sizedImage(`photo-${index}.jpg`, 1024))];
    await submitCreate(files);
    expect(await screen.findByText("Зар болон зураг амжилттай нэмэгдлээ")).toBeInTheDocument();
    expect(api.createAd).toHaveBeenCalledOnce();
    expect(api.upload).toHaveBeenCalledWith(55, files);
  });

  it("rejects exactly 5 MB plus 1 byte before advertisement creation", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate([sizedImage("photo.jpg", 5 * 1024 * 1024 + 1)]);
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("photo.jpg");
    expect(screen.getByRole("heading", { name: "Зар нэмэх" })).toBeInTheDocument();
    expect(api.createAd).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it.each([
    ["JPEG", "photo.jpg", "image/jpeg"],
    ["PNG", "photo.png", "image/png"],
    ["WEBP", "photo.webp", "image/webp"],
  ])("accepts a valid %s selection", async (_label, name, type) => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    const file = sizedImage(name, 1024, type);
    await submitCreate([file]);
    expect(await screen.findByText("Зар болон зураг амжилттай нэмэгдлээ")).toBeInTheDocument();
    expect(api.createAd).toHaveBeenCalledOnce();
    expect(api.upload).toHaveBeenCalledWith(55, [file]);
  });

  it("lists every oversized file without sending requests", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate([sizedImage("large-one.png", Math.round(6.2 * 1024 * 1024), "image/png"), sizedImage("large-two.webp", Math.round(8.1 * 1024 * 1024), "image/webp")]);
    const error = await screen.findByRole("alert");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(error).toHaveTextContent("large-one.png файлын хэмжээ 6.2 MB байна. Нэг зураг 5 MB-аас ихгүй байх ёстой.");
    expect(error).toHaveTextContent("large-two.webp файлын хэмжээ 8.1 MB байна. Нэг зураг 5 MB-аас ихгүй байх ёстой.");
    expect(api.createAd).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it("rejects nine files explicitly instead of silently truncating", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate(Array.from({ length: 9 }, (_, index) => sizedImage(`photo-${index}.jpg`, 1024)));
    expect(await screen.findByRole("alert")).toHaveTextContent("Нэг зар дээр хамгийн ихдээ 8 зураг оруулах боломжтой. Та 9 зураг сонгосон байна.");
    expect(screen.getByRole("heading", { name: "Зар нэмэх" })).toBeInTheDocument();
    expect(api.createAd).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it("rejects unsupported browser MIME types before requests", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate([sizedImage("photo.heic", 1024, "image/heic")]);
    expect(await screen.findByRole("alert")).toHaveTextContent("photo.heic формат дэмжигдэхгүй. JPG, PNG эсвэл WEBP зураг сонгоно уу.");
    expect(api.createAd).not.toHaveBeenCalled();
    expect(api.upload).not.toHaveBeenCalled();
  });

  it("clears the inline file error after a valid replacement selection", async () => {
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate([sizedImage("photo.heic", 1024, "image/heic")]);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    const valid = sizedImage("photo.jpg", 1024, "image/jpeg");
    fireEvent.change(screen.getByLabelText("Зураг"), { target: { files: [valid] } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole("heading", { name: "Зар нэмэх" }).closest("form")!);
    expect(await screen.findByText("Зар болон зураг амжилттай нэмэгдлээ")).toBeInTheDocument();
    expect(api.createAd).toHaveBeenCalledOnce();
    expect(api.upload).toHaveBeenCalledWith(55, [valid]);
  });

  it("maps a server-side 413 to a safe partial-success size warning", async () => {
    api.upload.mockRejectedValueOnce(new MockApiClientError(413));
    await renderApp(storedSession);
    await screen.findByText("Server Owner");
    await submitCreate([sizedImage("accepted-by-client.jpg", 1024)]);
    expect(await screen.findByText("Зар нэмэгдсэн боловч зураг 5 MB-ын хязгаараас хэтэрсэн тул upload хийгдээгүй.")).toBeInTheDocument();
    expect(api.createAd).toHaveBeenCalledOnce();
    expect(api.upload).toHaveBeenCalledOnce();
    expect(screen.queryByText(/gateway details|secret-token/i)).not.toBeInTheDocument();
  });
});
