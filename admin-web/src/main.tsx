import React from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, EyeOff, Flag, Moon, Search, Sun, Tags, Users } from "lucide-react";
import { ApiClient, createAdminApi, createAuthApi, createCatalogApi } from "@bozar/api-client";
import { themes, type ThemeName, type ThemeTokens } from "../../packages/design-tokens/src/index";
import { type AdminActionLog, type AdminReport, type AdminStats, type AdminUser, type Category } from "@bozar/shared-types";
import { filterAdminReports, filterAdminUsers, type ReportFilter, type UserFilter } from "./app-utils";
import "./styles.css";

type AuthSession = {
  token: string;
  user: {
    userId: number;
    fullName: string;
    phone: string;
    email?: string;
    role: string;
  };
};

type SubcategoryItem = {
  subcategoryId: number;
  categoryId: number;
  name: string;
};

const SESSION_STORAGE_KEY = "bozar.admin.session";
const THEME_STORAGE_KEY = "bozar.admin.theme";

function readStoredSession(): AuthSession | undefined {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.token || !parsed.user) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

const initialSession = readStoredSession();
const initialTheme = (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null) ?? "light";
let authToken: string | undefined = initialSession?.token;

const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  getToken: () => authToken,
});
const adminApi = createAdminApi(apiClient);
const authApi = createAuthApi(apiClient);
const catalogApi = createCatalogApi(apiClient);

function applyThemeVariables(theme: ThemeTokens) {
  const root = document.documentElement.style;
  root.setProperty("--color-background", theme.colors.background);
  root.setProperty("--color-surface", theme.colors.surface);
  root.setProperty("--color-surface-muted", theme.colors.surfaceMuted);
  root.setProperty("--color-surface-tint", theme.colors.surfaceTint);
  root.setProperty("--color-text", theme.colors.text);
  root.setProperty("--color-muted", theme.colors.muted);
  root.setProperty("--color-border", theme.colors.border);
  root.setProperty("--color-border-strong", theme.colors.borderStrong);
  root.setProperty("--color-accent", theme.colors.accent);
  root.setProperty("--color-accent-soft", theme.colors.accentSoft);
  root.setProperty("--color-accent-text", theme.colors.accentText);
  root.setProperty("--color-success", theme.colors.success);
  root.setProperty("--color-success-soft", theme.colors.successSoft);
  root.setProperty("--color-danger", theme.colors.danger);
  root.setProperty("--color-danger-soft", theme.colors.dangerSoft);
  root.setProperty("--radius-sm", `${theme.radius.sm}px`);
  root.setProperty("--radius-md", `${theme.radius.md}px`);
  root.setProperty("--radius-lg", `${theme.radius.lg}px`);
  root.setProperty("--radius-pill", `${theme.radius.pill}px`);
  root.setProperty("--layout-sidebar-width", `${theme.layout.adminSidebarWidth}px`);
}

applyThemeVariables(themes[initialTheme]);

function App() {
  const [stats, setStats] = React.useState<AdminStats>({ users: 0, ads: 0, activeAds: 0, reports: 0, categories: 0 });
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [logs, setLogs] = React.useState<AdminActionLog[]>([]);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subcategories, setSubcategories] = React.useState<SubcategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number>(0);
  const [categoryName, setCategoryName] = React.useState("");
  const [categoryIcon, setCategoryIcon] = React.useState("tag");
  const [categoryDescription, setCategoryDescription] = React.useState("");
  const [categoryEditId, setCategoryEditId] = React.useState<number | null>(null);
  const [subcategoryName, setSubcategoryName] = React.useState("");
  const [subcategoryDescription, setSubcategoryDescription] = React.useState("");
  const [subcategoryEditId, setSubcategoryEditId] = React.useState<number | null>(null);
  const [source, setSource] = React.useState<"api" | "offline">("offline");
  const [session, setSession] = React.useState<AuthSession | undefined>(initialSession);
  const [identifier, setIdentifier] = React.useState("99000000");
  const [password, setPassword] = React.useState("admin123");
  const [notice, setNotice] = React.useState("");
  const [reportFilter, setReportFilter] = React.useState<ReportFilter>("all");
  const [userFilter, setUserFilter] = React.useState<UserFilter>("all");
  const [userSearch, setUserSearch] = React.useState("");
  const [themeName, setThemeName] = React.useState<ThemeName>(initialTheme);

  React.useEffect(() => {
    applyThemeVariables(themes[themeName]);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  async function hydrateAdminData() {
    const [statsResponse, usersResponse, reportsResponse, logsResponse, categoriesResponse] = await Promise.all([
      adminApi.stats(),
      adminApi.users(),
      adminApi.reports(),
      adminApi.logs(),
      catalogApi.categories(),
    ]);

    setStats(statsResponse.data);
    setUsers(usersResponse.data);
    setReports(reportsResponse.data);
    setLogs(logsResponse.data);
    setCategories(categoriesResponse.data);
    setSource("api");

    if (selectedCategoryId) {
      try {
        const subcategoriesResponse = await catalogApi.subcategories(selectedCategoryId);
        setSubcategories((subcategoriesResponse.data.items as SubcategoryItem[]) ?? []);
      } catch {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }

  React.useEffect(() => {
    if (!session) {
      setSource("offline");
      setStats({ users: 0, ads: 0, activeAds: 0, reports: 0, categories: 0 });
      setUsers([]);
      setReports([]);
      setLogs([]);
      setCategories([]);
      setSubcategories([]);
      return;
    }

    let alive = true;
    hydrateAdminData()
      .then(() => {
        if (!alive) return;
      })
      .catch(() => {
        if (!alive) return;
      setStats({ users: 0, ads: 0, activeAds: 0, reports: 0, categories: 0 });
      setUsers([]);
      setReports([]);
      setLogs([]);
      setCategories([]);
        setSubcategories([]);
        setSource("offline");
        setNotice("Admin API холбогдсонгүй");
      });

    return () => {
      alive = false;
    };
  }, [session]);

  React.useEffect(() => {
    if (!session) return;

    let alive = true;
    catalogApi
      .subcategories(selectedCategoryId)
      .then((response) => {
        if (!alive) return;
        setSubcategories((response.data.items as SubcategoryItem[]) ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setSubcategories([]);
      });

    return () => {
      alive = false;
    };
  }, [selectedCategoryId, session]);

  React.useEffect(() => {
    if (!categories.length) return;
    if (!categories.some((category) => category.categoryId === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  async function login() {
    try {
      const response = await authApi.login({ identifier, password }) as { data: AuthSession };
      authToken = response.data.token;
      setSession(response.data);
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(response.data));
      setNotice("Admin нэвтэрлээ");
      await hydrateAdminData();
    } catch {
      setNotice("Нэвтрэлт амжилтгүй. Seed хийсэн эсэхээ шалгана уу.");
    }
  }

  function logout() {
    authToken = undefined;
    setSession(undefined);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSubcategories([]);
    setNotice("Гарлаа");
  }

  async function refreshAdminData() {
    try {
      const [statsResponse, usersResponse, reportsResponse, logsResponse, categoriesResponse] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.reports(),
        adminApi.logs(),
        catalogApi.categories(),
      ]);
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setReports(reportsResponse.data);
      setLogs(logsResponse.data);
      setCategories(categoriesResponse.data);
      setSource("api");
      if (selectedCategoryId) {
        const subcategoriesResponse = await catalogApi.subcategories(selectedCategoryId);
        setSubcategories((subcategoriesResponse.data.items as SubcategoryItem[]) ?? []);
      } else {
        setSubcategories([]);
      }
    } catch {
      setNotice("Admin data refresh амжилтгүй");
    }
  }

  async function resolveReport(report: AdminReport) {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    try {
      await adminApi.resolveReport(report.reportId);
      setNotice("Report шийдвэрлэгдлээ");
      await refreshAdminData();
    } catch {
      setNotice("Report resolve амжилтгүй");
    }
  }

  async function hideAd(report: AdminReport) {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    try {
      await adminApi.hideAd(report.adId);
      setNotice("Зар нуугдлаа");
      await refreshAdminData();
    } catch {
      setNotice("Зар нуух амжилтгүй");
    }
  }

  async function blockUser(user: AdminUser) {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    try {
      await adminApi.blockUser(user.userId);
      setNotice("Хэрэглэгч block хийгдлээ");
      await refreshAdminData();
    } catch {
      setNotice("User block амжилтгүй");
    }
  }

  async function suspendUser(user: AdminUser) {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    try {
      await adminApi.suspendUser(user.userId);
      setNotice("Хэрэглэгч suspend хийгдлээ");
      await refreshAdminData();
    } catch {
      setNotice("User suspend амжилтгүй");
    }
  }

  async function createCategory() {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    if (!categoryName.trim()) {
      setNotice("Category нэр оруулна уу");
      return;
    }
    try {
      await adminApi.createCategory({
        name: categoryName.trim(),
        icon: categoryIcon.trim() || "tag",
        description: categoryDescription.trim() || undefined,
      });
      setCategoryName("");
      setCategoryDescription("");
      setNotice("Category үүсгэлээ");
      await refreshAdminData();
    } catch {
      setNotice("Category үүсгэх амжилтгүй");
    }
  }

  function beginCategoryEdit(category: Category) {
    setCategoryEditId(category.categoryId);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setCategoryDescription(category.description);
  }

  async function saveCategory() {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    if (!categoryName.trim()) {
      setNotice("Category нэр оруулна уу");
      return;
    }

    try {
      if (categoryEditId) {
        await adminApi.updateCategory(categoryEditId, {
          name: categoryName.trim(),
          icon: categoryIcon.trim() || "tag",
          description: categoryDescription.trim() || undefined,
        });
        setNotice("Category шинэчиллээ");
      } else {
        await adminApi.createCategory({
          name: categoryName.trim(),
          icon: categoryIcon.trim() || "tag",
          description: categoryDescription.trim() || undefined,
        });
        setNotice("Category үүсгэлээ");
      }

      setCategoryName("");
      setCategoryIcon("tag");
      setCategoryDescription("");
      setCategoryEditId(null);
      await refreshAdminData();
    } catch {
      setNotice("Category хадгалах амжилтгүй");
    }
  }

  function beginSubcategoryEdit(subcategory: SubcategoryItem) {
    setSelectedCategoryId(subcategory.categoryId);
    setSubcategoryEditId(subcategory.subcategoryId);
    setSubcategoryName(subcategory.name);
    setSubcategoryDescription("");
  }

  async function saveSubcategory() {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    if (!subcategoryName.trim()) {
      setNotice("Subcategory нэр оруулна уу");
      return;
    }

    try {
      if (subcategoryEditId) {
        await adminApi.updateSubcategory(subcategoryEditId, {
          name: subcategoryName.trim(),
          description: subcategoryDescription.trim() || undefined,
        });
        setNotice("Subcategory шинэчиллээ");
      } else {
        await adminApi.createSubcategory(selectedCategoryId, {
          name: subcategoryName.trim(),
          description: subcategoryDescription.trim() || undefined,
        });
        setNotice("Subcategory үүсгэлээ");
      }

      setSubcategoryName("");
      setSubcategoryDescription("");
      setSubcategoryEditId(null);
      await refreshAdminData();
    } catch {
      setNotice("Subcategory хадгалах амжилтгүй");
    }
  }

  async function removeSubcategory(subcategory: SubcategoryItem) {
    try {
      await adminApi.deleteSubcategory(subcategory.subcategoryId);
      setNotice("Subcategory идэвхгүй болголоо");
      await refreshAdminData();
    } catch {
      setNotice("Subcategory устгах амжилтгүй");
    }
  }

  async function disableCategory(category: Category) {
    if (!session) {
      setNotice("Эхлээд admin эрхээр нэвтэрнэ үү");
      return;
    }
    try {
      await adminApi.deleteCategory(category.categoryId);
      setNotice("Category идэвхгүй болголоо");
      await refreshAdminData();
    } catch {
      setNotice("Category идэвхгүй болгох амжилтгүй");
    }
  }

  const visibleReports = filterAdminReports(reports, reportFilter);
  const visibleUsers = filterAdminUsers(users, userFilter, userSearch);

  return (
    <main className="admin">
      <aside>
        <strong>БӨ Зар Admin</strong>
        <a className="active"><BarChart3 size={18} /> Dashboard</a>
        <a><Flag size={18} /> Reports</a>
        <a><Users size={18} /> Users</a>
        <a><Tags size={18} /> Categories</a>
      </aside>
      <section>
        <div className="page-head">
          <div>
            <span className="eyebrow">Moderation center</span>
            <h1>Dashboard</h1>
          </div>
          <div className="head-actions">
            <span className="source">{source === "api" ? "Live data" : "No data"}</span>
            <button type="button" onClick={() => setThemeName((current) => (current === "light" ? "dark" : "light"))} title="Theme">
              {themeName === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            {session ? <button onClick={logout}>Гарах</button> : null}
          </div>
        </div>

        {!session && (
          <div className="login-panel">
            <div>
              <h2>Admin нэвтрэх</h2>
              <p>Admin эрхээр нэвтэрч moderation API-г шалгана.</p>
            </div>
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="99000000" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="admin123" />
            <button onClick={login}>Нэвтрэх</button>
          </div>
        )}

        <div className="stats">
          <article><span>Нийт зар</span><strong>{stats.ads}</strong></article>
          <article><span>Active зар</span><strong>{stats.activeAds}</strong></article>
          <article><span>Reports</span><strong>{stats.reports}</strong></article>
          <article><span>Users</span><strong>{stats.users}</strong></article>
          <article><span>Categories</span><strong>{stats.categories}</strong></article>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>User moderation</h2>
            <div className="head-actions-inline">
              <div className="search-box">
                <Search size={16} />
                <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users" />
              </div>
              <button type="button" onClick={() => setUserFilter("all")}>All</button>
              <button type="button" onClick={() => setUserFilter("active")}>Active</button>
              <button type="button" onClick={() => setUserFilter("blocked")}>Blocked</button>
              <button type="button" onClick={() => setUserFilter("suspended")}>Suspended</button>
            </div>
          </div>
          <div className="report-list">
            {visibleUsers.length === 0 ? (
              <div className="empty-row">No users match the current filters.</div>
            ) : (
              visibleUsers.map((user) => (
                <div className="report-row" key={user.userId}>
                  <div>
                    <strong>{user.fullName}</strong>
                    <p>
                      {user.phone}
                      {user.email ? ` · ${user.email}` : ""}
                      {user.locationName ? ` · ${user.locationName}` : ""}
                    </p>
                  </div>
                  <span>{user.role}</span>
                  <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                  <span className="source">{user.adCount} ads</span>
                  <div className="row-actions">
                    <button type="button" onClick={() => void blockUser(user)}>Block</button>
                    <button type="button" onClick={() => void suspendUser(user)}>Suspend</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Recent reports</h2>
            <div className="head-actions-inline">
              <button onClick={() => setReportFilter("all")}>All</button>
              <button onClick={() => setReportFilter("pending")}>Pending</button>
              <button onClick={() => setReportFilter("reviewed")}>Reviewed</button>
              <button><EyeOff size={16} /> Bulk action</button>
            </div>
          </div>
          <div className="report-list">
            {visibleReports.map((report) => (
              <div className="report-row" key={report.reportId}>
                <div>
                  <strong>{report.adTitle}</strong>
                  <p>{report.comment ?? "Тайлбар байхгүй"}</p>
                </div>
                <span>{report.reason}</span>
                <span className={`status ${report.status.toLowerCase()}`}>{report.status}</span>
                <div className="row-actions">
                  <button onClick={() => void resolveReport(report)}>Resolve</button>
                  <button onClick={() => void hideAd(report)}>Hide ad</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Recent admin actions</h2>
          </div>
          <div className="report-list">
            {logs.length === 0 ? (
              <div className="empty-row">Action log одоогоор хоосон байна.</div>
            ) : (
              logs.map((log) => (
                <div className="report-row" key={log.logId}>
                  <div>
                    <strong>{log.actionType}</strong>
                    <p>{log.description ?? "Тайлбар байхгүй"}</p>
                  </div>
                  <span>{log.targetType}</span>
                  <span className="status reviewed">#{log.targetId}</span>
                  <span>{log.adminName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Category management</h2>
            <div className="head-actions-inline">
              {categoryEditId ? <span className="source">Editing #{categoryEditId}</span> : null}
              <button onClick={() => void saveCategory()}>{categoryEditId ? "Save" : "Create"}</button>
            </div>
          </div>
          <div className="category-form">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" />
            <input value={categoryIcon} onChange={(event) => setCategoryIcon(event.target.value)} placeholder="icon" />
            <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Description" />
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <div className="category-row" key={category.categoryId}>
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.description}</p>
                </div>
                <span>{category.count} зар</span>
                <div className="row-actions">
                  <button onClick={() => beginCategoryEdit(category)}>Edit</button>
                  <button onClick={() => void disableCategory(category)}>Disable</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Subcategory management</h2>
            <div className="head-actions-inline">
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(Number(event.target.value))}>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              {subcategoryEditId ? <span className="source">Editing #{subcategoryEditId}</span> : null}
              <button onClick={() => void saveSubcategory()}>{subcategoryEditId ? "Save" : "Create"}</button>
            </div>
          </div>
          <div className="category-form">
            <input value={subcategoryName} onChange={(event) => setSubcategoryName(event.target.value)} placeholder="Subcategory name" />
            <input value={subcategoryDescription} onChange={(event) => setSubcategoryDescription(event.target.value)} placeholder="Description" />
            <button onClick={() => {
              setSubcategoryEditId(null);
              setSubcategoryName("");
              setSubcategoryDescription("");
            }}>Reset</button>
          </div>
          <div className="category-list">
            {subcategories.length === 0 ? (
              <div className="empty-row">No subcategories for this category.</div>
            ) : (
              subcategories.map((subcategory) => (
                <div className="category-row" key={subcategory.subcategoryId}>
                  <div>
                    <strong>{subcategory.name}</strong>
                    <p>Category #{subcategory.categoryId}</p>
                  </div>
                  <span>Sub #{subcategory.subcategoryId}</span>
                  <div className="row-actions">
                    <button onClick={() => beginSubcategoryEdit(subcategory)}>Edit</button>
                    <button onClick={() => void removeSubcategory(subcategory)}>Disable</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      {notice ? <div className="toast">{notice}</div> : null}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
