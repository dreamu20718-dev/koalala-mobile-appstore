const STORAGE_KEYS = {
  users: "fs_oms_users",
  currentUser: "fs_oms_current_user",
  products: "fs_oms_products",
  orders: "fs_oms_orders",
};
const DEFAULT_RESET_PASSWORD = "123456";
const APP_NAME = "考拉拉专车";
const APP_VERSION = "1.0.0.1";
const APP_BRAND = `${APP_NAME} V${APP_VERSION}`;
const APP_DISPLAY_NAME = APP_NAME;
const APP_PAGE_TITLE = `${APP_NAME}订单中心`;
const APP_COPYRIGHT = "版权归公司 IPLAY PTY LTD 所有";
const API_BASE_URL_RAW =
  (window.KOALALA_API_BASE && String(window.KOALALA_API_BASE).trim()) ||
  "https://koalala-api.workers.dev";
const API_BASE_URL = API_BASE_URL_RAW.replace(/\/+$/, "");
const CLOUD_SYNC_ENABLED =
  /^https?:\/\//.test(API_BASE_URL) && API_BASE_URL !== "https://koalala-api.workers.dev";
const CLOUD_SYNC_DEBOUNCE_MS = 600;
const CLOUD_SYNC_REQUEST_TIMEOUT_MS = 10000;
const REMOTE_EMPTY_HINT_KEYS = ["users", "products", "orders"];

const MENU_ITEMS = [
  { key: "products", label: "可预订产品" },
  { key: "orders", label: "我的订单" },
  { key: "dispatch-center", label: "订单分配中心" },
  { key: "my-tasks", label: "我的任务" },
  { key: "settlement-report", label: "结算统计" },
  { key: "my-profile", label: "我的信息" },
  { key: "user-permissions", label: "新增账号" },
  { key: "account-query", label: "账号查询" },
];

const DEFAULT_USER_PERMISSIONS = ["products", "orders", "settlement-report", "my-profile"];
const ALL_PERMISSIONS = MENU_ITEMS.map((item) => item.key);
const PAGE_SIZE = 10;
const USER_ROLES = [
  { key: "supplier", label: "供应商" },
  { key: "driver", label: "司机" },
  { key: "admin", label: "管理员" },
];
const ORDER_STATUS_OPTIONS = [
  { key: "pending", label: "待处理" },
  { key: "dispatched", label: "已派发" },
  { key: "confirmed", label: "已确认" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];
const ACCOUNT_STATUS_OPTIONS = [
  { key: "pending", label: "待审核" },
  { key: "enabled", label: "启用中" },
  { key: "disabled", label: "已禁用" },
];
const DEFAULT_USER_ROLE = "driver";

const STATE = {
  authMode: "login",
  activeView: "products",
  addUserRoleView: "supplier",
  users: [],
  currentUser: null,
  products: [],
  orders: [],
  modalProductId: null,
  taskDetailOrderId: null,
  accountDetailUserId: null,
  orderSearch: {
    orders: { orderNo: "", date: "" },
    "dispatch-center": { orderNo: "", date: "", status: "" },
    "my-tasks": { orderNo: "", date: "" },
    "account-query": { orderNo: "", date: "", role: "", status: "" },
  },
  settlementFilter: {
    startDate: "",
    endDate: "",
  },
  pagination: {
    products: 1,
    orders: 1,
    "dispatch-center": 1,
    "my-tasks": 1,
    "settlement-report": 1,
    "account-query": 1,
  },
};

const CLOUD_SYNC_STATE = {
  timer: null,
  inFlight: false,
  queued: false,
  notifyOnFailure: true,
};

const seedUsers = [];

const seedProducts = [
  {
    id: "P1001",
    name: "A：墨尔本市区游 10 小时",
    desc: "适合首次到访墨尔本的客户，核心城市景点可灵活调整。",
    currency: "RMB",
    tags: ["10小时", "可选出行日期", "可选车型"],
    vehicleOptions: [
      { code: "comfort-5", label: "舒适5座", price: 2200 },
      { code: "business-7", label: "商务7座", price: 2850 },
      { code: "luxury-8", label: "豪华8座", price: 3100 },
      { code: "minibus-12", label: "12座小巴", price: 3950 },
    ],
  },
  {
    id: "P1002",
    name: "B：墨尔本周边游 10 小时",
    desc: "周边热门线路可定制，停靠点可按需求灵活安排。",
    currency: "RMB",
    tags: ["10小时", "周边线路", "可选车型"],
    vehicleOptions: [
      { code: "comfort-5", label: "舒适5座", price: 2500 },
      { code: "business-7", label: "商务7座", price: 3150 },
      { code: "luxury-8", label: "豪华8座", price: 3400 },
      { code: "minibus-12", label: "12座小巴", price: 4250 },
    ],
  },
  {
    id: "P1003",
    name: "C：大洋路一日游 12 小时",
    desc: "经典大洋路当天往返线路，覆盖核心海岸景观点。",
    currency: "RMB",
    tags: ["12小时", "大洋路", "可选车型"],
    vehicleOptions: [
      { code: "comfort-5", label: "舒适5座", price: 2680 },
      { code: "business-7", label: "商务7座", price: 3340 },
      { code: "luxury-8", label: "豪华8座", price: 3650 },
      { code: "minibus-12", label: "12座小巴", price: 4500 },
    ],
  },
  {
    id: "P1004",
    name: "D：大洋路两日游 10 小时/天",
    desc: "两天深度游线路，行程更从容，适合小团定制出行。",
    currency: "RMB",
    tags: ["2天", "10小时/天", "可选车型"],
    vehicleOptions: [
      { code: "comfort-5", label: "舒适5座", price: 5500 },
      { code: "business-7", label: "商务7座", price: 6200 },
      { code: "luxury-8", label: "豪华8座", price: 7000 },
      { code: "minibus-12", label: "12座小巴", price: 8600 },
    ],
  },
  {
    id: "P1005",
    name: "E：高尔夫VIP臻享一日体验 10 小时",
    desc: "不含果岭费和装备球杆租赁费，如需预定请备注。",
    currency: "RMB",
    tags: ["10小时", "高尔夫VIP", "豪华8座商务车"],
    vehicleOptions: [
      { code: "golf-vip-8", label: "豪华8座商务车", price: 3400 },
    ],
  },
];

function normalizeProductCatalogLanguage(products) {
  const templateMap = new Map(seedProducts.map((item) => [item.id, item]));
  return (Array.isArray(products) ? products : []).map((product) => {
    const template = templateMap.get(product?.id);
    if (!template || !product || typeof product !== "object") return product;

    const templateOptionMap = new Map(
      (Array.isArray(template.vehicleOptions) ? template.vehicleOptions : []).map((opt) => [opt.code, opt])
    );
    const existingOptions = Array.isArray(product.vehicleOptions) ? product.vehicleOptions : [];
    const existingOptionMap = new Map(
      existingOptions
        .filter((opt) => opt && typeof opt === "object" && opt.code)
        .map((opt) => [opt.code, opt])
    );

    const mergedTemplateOptions = (Array.isArray(template.vehicleOptions) ? template.vehicleOptions : []).map((tmpl) => {
      const existing = existingOptionMap.get(tmpl.code);
      if (!existing || typeof existing !== "object") {
        return { ...tmpl };
      }
      return {
        ...existing,
        code: tmpl.code,
        label: tmpl.label,
      };
    });
    const extraOptions = existingOptions.filter(
      (opt) => opt && typeof opt === "object" && opt.code && !templateOptionMap.has(opt.code)
    );
    const vehicleOptions = [...mergedTemplateOptions, ...extraOptions];

    return {
      ...product,
      name: template.name,
      desc: template.desc,
      tags: [...template.tags],
      vehicleOptions,
    };
  });
}

function normalizeOrderLanguage(orders, products) {
  const productMap = new Map(
    (Array.isArray(products) ? products : []).map((item) => [item?.id, item])
  );
  return (Array.isArray(orders) ? orders : []).map((order) => {
    if (!order || typeof order !== "object") return order;
    const product = productMap.get(order.productId);
    if (!product) return order;

    const vehicle = (Array.isArray(product.vehicleOptions) ? product.vehicleOptions : []).find(
      (opt) => opt && opt.code === order.vehicleCode
    );

    return {
      ...order,
      productName: product.name || order.productName,
      vehicleLabel: vehicle?.label || order.vehicleLabel,
    };
  });
}

function safeParse(json, fallback) {
  try {
    const val = JSON.parse(json);
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitizePhone(input) {
  return String(input || "")
    .trim()
    .replace(/\s+/g, "");
}

function normalizeRole(role, fallback = DEFAULT_USER_ROLE) {
  const val = String(role || "").trim();
  return USER_ROLES.some((item) => item.key === val) ? val : fallback;
}

function normalizeReviewStatus(status, fallback = "approved") {
  const value = String(status || "").trim();
  if (value === "pending" || value === "approved") return value;
  return fallback;
}

function getUserAccountStatusKey(user) {
  const reviewStatus = normalizeReviewStatus(user?.reviewStatus);
  if (reviewStatus !== "approved") return "pending";
  return user?.enabled === false ? "disabled" : "enabled";
}

function getUserAccountStatusText(user) {
  const key = getUserAccountStatusKey(user);
  return ACCOUNT_STATUS_OPTIONS.find((item) => item.key === key)?.label || "未知";
}

function getUserAccountStatusClass(user) {
  const key = getUserAccountStatusKey(user);
  if (key === "pending") return "pending";
  if (key === "disabled") return "cancelled";
  return "confirmed";
}

function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  return USER_ROLES.find((item) => item.key === normalized)?.label || "未知";
}

function getDefaultPermissionsByRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return [...ALL_PERMISSIONS];
  if (normalized === "driver") return ["my-tasks", "settlement-report", "my-profile"];
  if (normalized === "supplier") return ["products", "orders", "settlement-report", "my-profile"];
  return [...DEFAULT_USER_PERMISSIONS];
}

function isRolePermissionFixed(role) {
  const normalized = normalizeRole(role);
  return normalized === "driver" || normalized === "supplier";
}

function normalizePermissionKeys(keys, fallback = DEFAULT_USER_PERMISSIONS) {
  const source = Array.isArray(keys) && keys.length ? keys : fallback;
  return Array.from(new Set(source.filter((key) => ALL_PERMISSIONS.includes(key))));
}

function normalizeUser(rawUser, index) {
  const source = rawUser && typeof rawUser === "object" ? rawUser : {};
  const rawAccount = String(source.account || "").trim();
  const account = rawAccount;
  const phone = sanitizePhone(source.phone);
  const rawLicenseImage = String(source.licenseImage || "").trim();
  const normalizedLicenseImage = rawLicenseImage === "-" ? "" : rawLicenseImage;
  const inferredAccount = account || phone || `user_${Date.now()}_${index}`;
  const nickname =
    String(source.nickname || "").trim() ||
    String(source.driverName || "").trim() ||
    inferredAccount;
  const driverName = String(source.driverName || "").trim() || nickname;
  const role = normalizeRole(source.role, DEFAULT_USER_ROLE);
  const defaultPermissions = getDefaultPermissionsByRole(role);

  return {
    id: String(source.id || `U${Date.now()}${index}`),
    account: inferredAccount,
    password: String(source.password || DEFAULT_RESET_PASSWORD),
    nickname,
    driverName,
    phone,
    licenseNo: String(source.licenseNo || "").trim(),
    licenseImage: normalizedLicenseImage,
    companyName: String(source.companyName || "").trim(),
    companyContact: String(source.companyContact || "").trim(),
    companyPhone: sanitizePhone(source.companyPhone),
    companyAddress: String(source.companyAddress || "").trim(),
    businessScope: String(source.businessScope || "").trim(),
    homeAddress: String(source.homeAddress || "").trim(),
    vehicleModel: String(source.vehicleModel || "").trim(),
    vehiclePlate: String(source.vehiclePlate || "").trim(),
    vehicleSeats: String(source.vehicleSeats || "").trim(),
    vehicleDesc: String(source.vehicleDesc || "").trim(),
    enabled: source.enabled !== false,
    reviewStatus: normalizeReviewStatus(source.reviewStatus, "approved"),
    role,
    permissions: normalizePermissionKeys(source.permissions, defaultPermissions),
  };
}

function persistLocal() {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(STATE.users));
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(STATE.currentUser));
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(STATE.products));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(STATE.orders));
}

function buildCloudStatePayload() {
  return {
    users: STATE.users,
    products: STATE.products,
    orders: STATE.orders,
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = CLOUD_SYNC_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCloudState() {
  if (!CLOUD_SYNC_ENABLED) return null;
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/state`, { method: "GET" });
  if (!response.ok) {
    throw new Error(`云端读取失败(${response.status})`);
  }
  const payload = await response.json();
  return payload?.data || null;
}

async function pushCloudState() {
  if (!CLOUD_SYNC_ENABLED) return;
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCloudStatePayload()),
  });
  if (!response.ok) {
    throw new Error(`云端保存失败(${response.status})`);
  }
}

function queueCloudSync(immediate = false) {
  if (!CLOUD_SYNC_ENABLED) return;
  CLOUD_SYNC_STATE.queued = true;
  if (CLOUD_SYNC_STATE.timer) return;
  CLOUD_SYNC_STATE.timer = setTimeout(() => {
    CLOUD_SYNC_STATE.timer = null;
    runCloudSync();
  }, immediate ? 30 : CLOUD_SYNC_DEBOUNCE_MS);
}

async function runCloudSync() {
  if (!CLOUD_SYNC_ENABLED) return;
  if (!CLOUD_SYNC_STATE.queued || CLOUD_SYNC_STATE.inFlight) return;

  CLOUD_SYNC_STATE.inFlight = true;
  CLOUD_SYNC_STATE.queued = false;
  try {
    await pushCloudState();
    CLOUD_SYNC_STATE.notifyOnFailure = true;
  } catch (error) {
    if (CLOUD_SYNC_STATE.notifyOnFailure) {
      showToast("云端同步失败，已保留本地数据");
      CLOUD_SYNC_STATE.notifyOnFailure = false;
    }
    console.error(error);
  } finally {
    CLOUD_SYNC_STATE.inFlight = false;
    if (CLOUD_SYNC_STATE.queued) {
      queueCloudSync(true);
    }
  }
}

function persist(options = { remote: true }) {
  persistLocal();
  if (options.remote !== false) {
    queueCloudSync();
  }
}

function hasStructuredVehiclesInProducts(products) {
  return (
    Array.isArray(products) &&
    products.length === seedProducts.length &&
    products.every((product) => Array.isArray(product?.vehicleOptions) && product.vehicleOptions.length > 0)
  );
}

function applyLoadedState({ users, products, orders, currentUser }) {
  const hasStructuredVehicles = hasStructuredVehiclesInProducts(products);

  STATE.users = (Array.isArray(users) && users.length ? users : deepClone(seedUsers)).map(normalizeUser);
  STATE.users = STATE.users.map((user) => {
    const roleDefaults = getDefaultPermissionsByRole(user.role);
    if (isRolePermissionFixed(user.role)) {
      user.permissions = [...roleDefaults];
    } else {
      user.permissions = normalizePermissionKeys(user.permissions, roleDefaults);
      if (!user.permissions.length) {
        user.permissions = [...roleDefaults];
      }
    }
    return user;
  });

  STATE.products = hasStructuredVehicles ? normalizeProductCatalogLanguage(products) : deepClone(seedProducts);
  STATE.orders = normalizeOrderLanguage(Array.isArray(orders) ? orders : [], STATE.products);
  STATE.currentUser = currentUser || null;

  removeLegacyDemoAccount();
  ensureAtLeastOneEnabledAdmin();

  if (STATE.currentUser) {
    const current =
      STATE.users.find((u) => u.id === STATE.currentUser.id) ||
      STATE.users.find(
        (u) => u.account === STATE.currentUser.account || (u.phone && u.phone === STATE.currentUser.phone)
      );
    STATE.currentUser = current || null;
    if (
      STATE.currentUser &&
      (normalizeReviewStatus(STATE.currentUser.reviewStatus) !== "approved" || STATE.currentUser.enabled === false)
    ) {
      STATE.currentUser = null;
    }
  }

  ensureActiveViewAllowed();
}

function removeLegacyDemoAccount() {
  STATE.users = STATE.users.filter((user) => user.account !== "demo");
}

function ensureAtLeastOneEnabledAdmin() {
  const adminUsers = STATE.users.filter((user) => normalizeRole(user.role) === "admin");
  if (!adminUsers.length) return;
  if (adminUsers.some((user) => user.enabled !== false && normalizeReviewStatus(user.reviewStatus) === "approved")) {
    return;
  }
  adminUsers[0].enabled = true;
  adminUsers[0].reviewStatus = "approved";
}

function getUserById(userId) {
  return STATE.users.find((u) => u.id === userId);
}

function hasPermission(user, permissionKey) {
  return Boolean(user && Array.isArray(user.permissions) && user.permissions.includes(permissionKey));
}

function getAllowedMenuItems(user = STATE.currentUser) {
  return MENU_ITEMS.filter((item) => hasPermission(user, item.key));
}

function ensureActiveViewAllowed() {
  if (!STATE.currentUser) return;
  const allowed = getAllowedMenuItems(STATE.currentUser);
  if (!allowed.length) {
    STATE.activeView = "";
    return;
  }
  if (!allowed.some((item) => item.key === STATE.activeView)) {
    STATE.activeView = allowed[0].key;
  }
}

function load() {
  const users = safeParse(localStorage.getItem(STORAGE_KEYS.users), []);
  const products = safeParse(localStorage.getItem(STORAGE_KEYS.products), []);
  const orders = safeParse(localStorage.getItem(STORAGE_KEYS.orders), []);
  const currentUser = safeParse(localStorage.getItem(STORAGE_KEYS.currentUser), null);

  applyLoadedState({ users, products, orders, currentUser });
  persist({ remote: false });
}

function isRemoteStateEmpty(data) {
  if (!data || typeof data !== "object") return true;
  return REMOTE_EMPTY_HINT_KEYS.every((key) => Array.isArray(data[key]) && data[key].length === 0);
}

function shouldUseRemoteState(remote) {
  const remoteUsersCount = Array.isArray(remote?.users) ? remote.users.length : 0;
  const remoteOrdersCount = Array.isArray(remote?.orders) ? remote.orders.length : 0;
  const localUsersCount = Array.isArray(STATE.users) ? STATE.users.length : 0;
  const localOrdersCount = Array.isArray(STATE.orders) ? STATE.orders.length : 0;

  if (remoteUsersCount === 0 && remoteOrdersCount === 0 && (localUsersCount > 0 || localOrdersCount > 0)) {
    return false;
  }
  return true;
}

async function hydrateFromCloud() {
  if (!CLOUD_SYNC_ENABLED) return;
  try {
    const remote = await fetchCloudState();
    if (!remote) return;

    if (isRemoteStateEmpty(remote)) {
      queueCloudSync(true);
      return;
    }

    if (!shouldUseRemoteState(remote)) {
      queueCloudSync(true);
      return;
    }

    applyLoadedState({
      users: remote.users,
      products: remote.products,
      orders: remote.orders,
      currentUser: STATE.currentUser,
    });
    persist({ remote: false });
    render();
  } catch (error) {
    console.error(error);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isValidPhone(phone) {
  return /^\+?[0-9\-]{6,20}$/.test(phone);
}

function findUserByCredentials(accountInput, password) {
  const normalizedLogin = String(accountInput || "").trim();
  const compactLogin = sanitizePhone(normalizedLogin);
  return (
    STATE.users.find((u) => {
      if (u.password !== password) return false;
      return (
        u.account === normalizedLogin ||
        (u.phone && (u.phone === normalizedLogin || u.phone === compactLogin))
      );
    }) || null
  );
}

async function refreshUsersFromCloudForLogin(options = {}) {
  const { strict = false } = options;
  if (!CLOUD_SYNC_ENABLED) return false;
  const remote = await fetchCloudState();
  if (!remote || !shouldUseRemoteState(remote)) {
    if (strict) {
      throw new Error("云端账号同步失败");
    }
    return false;
  }

  applyLoadedState({
    users: remote.users,
    products: remote.products,
    orders: remote.orders,
    currentUser: null,
  });
  persist({ remote: false });
  return true;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getFutureDateISOByMonths(months) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + Number(months || 0));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getProductVehicleOptions(product) {
  if (!product || !Array.isArray(product.vehicleOptions)) return [];
  return product.vehicleOptions.filter((opt) => opt && typeof opt === "object" && opt.code && opt.label);
}

function getMinVehiclePrice(product) {
  const options = getProductVehicleOptions(product);
  if (!options.length) return 0;
  return Math.min(...options.map((opt) => Number(opt.price) || 0));
}

function getVehicleOptionByCode(product, code) {
  return getProductVehicleOptions(product).find((opt) => opt.code === code) || null;
}

function getOrderOwner(order) {
  return getUserById(order.userId);
}

function getOrderOwnerRole(order) {
  return normalizeRole(order.createdByRole || getOrderOwner(order)?.role || "supplier", "supplier");
}

function getOrderSupplierOrders() {
  return STATE.orders.filter((order) => getOrderOwnerRole(order) === "supplier");
}

function getDriverUsers() {
  return STATE.users.filter((user) => user.role === "driver" && user.enabled !== false);
}

function getOrderStatusText(status) {
  if (status === "pending") return "待处理";
  if (status === "dispatched") return "已派发";
  if (status === "confirmed") return "已确认";
  if (status === "completed") return "已完成";
  if (status === "cancelled") return "已取消";
  return status || "未知";
}

function nowDateTimeText() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function isServiceDateOnOrBeforeToday(travelDate) {
  const dateText = String(travelDate || "").trim();
  if (!dateText) return false;
  return dateText <= getTodayISO();
}

function getDefaultDispatchAmount(order) {
  const total = Number(order?.totalAmount) || 0;
  return Math.max(0, Math.round(total * 85) / 100);
}

function getOrderDispatchAmount(order) {
  const value = Number(order?.dispatchAmount);
  if (Number.isFinite(value) && value > 0) return value;
  return getDefaultDispatchAmount(order);
}

function formatDispatchAmountInput(value) {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function formatSettlementMoney(value, currency) {
  const val = Number(value) || 0;
  if ((currency || "").toUpperCase() === "RMB") {
    return Number.isInteger(val) ? `RMB ${val}` : `RMB ${val.toFixed(2)}`;
  }
  return `${currency || "AUD"} ${val.toFixed(2)}`;
}

function getOrderSearchState(viewKey) {
  if (!STATE.orderSearch[viewKey]) {
    STATE.orderSearch[viewKey] = { orderNo: "", date: "" };
  }
  const state = STATE.orderSearch[viewKey];
  if (typeof state.orderNo !== "string") state.orderNo = "";
  if (typeof state.date !== "string") state.date = "";
  if (typeof state.role !== "string") state.role = "";
  if (typeof state.status !== "string") state.status = "";
  return state;
}

function getPageState(viewKey) {
  const current = Number(STATE.pagination[viewKey]) || 1;
  STATE.pagination[viewKey] = current > 0 ? Math.floor(current) : 1;
  return STATE.pagination[viewKey];
}

function paginateRecords(records, viewKey) {
  const list = Array.isArray(records) ? records : [];
  const totalRecords = list.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = Math.min(getPageState(viewKey), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRecords = list.slice(startIndex, startIndex + PAGE_SIZE);
  STATE.pagination[viewKey] = currentPage;
  return {
    records: pageRecords,
    totalRecords,
    currentPage,
    totalPages,
    startIndex,
  };
}

function renderPagination(viewKey, pageInfo) {
  if (!pageInfo || pageInfo.totalRecords <= PAGE_SIZE) return "";
  const start = pageInfo.startIndex + 1;
  const end = pageInfo.startIndex + pageInfo.records.length;
  return `
    <div class="pagination-bar">
      <div class="hint">第 ${pageInfo.currentPage} / ${pageInfo.totalPages} 页，共 ${pageInfo.totalRecords} 条，当前 ${start}-${end} 条</div>
      <div class="pagination-actions">
        <button class="btn btn-outline btn-xs" type="button" data-page-prev="${viewKey}" ${pageInfo.currentPage <= 1 ? "disabled" : ""}>上一页</button>
        <button class="btn btn-outline btn-xs" type="button" data-page-next="${viewKey}" data-total-pages="${pageInfo.totalPages}" ${pageInfo.currentPage >= pageInfo.totalPages ? "disabled" : ""}>下一页</button>
      </div>
    </div>
  `;
}

function applyOrderSearchFilter(orders, filter) {
  const orderNo = String(filter?.orderNo || "").trim().toLowerCase();
  const date = String(filter?.date || "").trim();
  const status = String(filter?.status || "").trim();
  return orders.filter((order) => {
    if (orderNo && !String(order.orderNo || "").toLowerCase().includes(orderNo)) {
      return false;
    }
    if (date && String(order.travelDate || "") !== date) {
      return false;
    }
    if (status && String(order.status || "") !== status) {
      return false;
    }
    return true;
  });
}

function getOrdersByUser(userId) {
  return STATE.orders.filter((order) => order.userId === userId);
}

function getMatchedOrdersForUser(user, filter) {
  if (!user) return [];
  return applyOrderSearchFilter(getOrdersByUser(user.id), filter);
}

function getFilteredUsersForAccountQuery() {
  const filter = getOrderSearchState("account-query");
  const roleFilter = USER_ROLES.some((item) => item.key === filter.role) ? filter.role : "";
  const statusFilter = ACCOUNT_STATUS_OPTIONS.some((item) => item.key === filter.status) ? filter.status : "";
  const accountKeyword = String(filter.orderNo || "").trim().toLowerCase();
  return STATE.users.filter((user) => {
    if (roleFilter && normalizeRole(user.role) !== roleFilter) return false;
    if (statusFilter && getUserAccountStatusKey(user) !== statusFilter) return false;
    if (accountKeyword) {
      const accountText = String(user.account || "").toLowerCase();
      if (!accountText.includes(accountKeyword)) return false;
    }
    return true;
  });
}

function escapeExcelCell(value) {
  const str = String(value ?? "");
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function downloadExcelHtml(filenamePrefix, thead, tbody) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["﻿", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `${filenamePrefix}_${timestamp}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportOrdersToExcel(orders, filenamePrefix) {
  if (!orders.length) {
    showToast("暂无可导出的订单数据");
    return;
  }

  const rows = orders.map((order, index) => {
    const owner = getOrderOwner(order);
    const supplierName = order.createdByName || owner?.driverName || owner?.nickname || "-";
    const supplierAccount = order.createdByAccount || owner?.account || "-";
    return {
      index: index + 1,
      orderNo: order.orderNo || "-",
      status: getOrderStatusText(order.status),
      travelDate: order.travelDate || "-",
      productName: order.productName || "-",
      vehicleLabel: order.vehicleLabel || "-",
      contactName: order.contactName || "-",
      contactPhone: order.contactPhone || "-",
      contactWechat: order.contactWechat || "-",
      pickupAddress: order.pickupAddress || "-",
      amount: formatMoney(order.totalAmount, order.currency),
      dispatchAmount: formatSettlementMoney(getOrderDispatchAmount(order), order.currency),
      supplierName,
      supplierAccount,
      assignedDriverName: order.assignedDriverName || "-",
      assignedDriverAccount: order.assignedDriverAccount || "-",
      createdAt: order.createdAt || "-",
    };
  });

  const headerMap = [
    ["序号", "index"],
    ["订单号", "orderNo"],
    ["状态", "status"],
    ["出行日期", "travelDate"],
    ["产品", "productName"],
    ["车型", "vehicleLabel"],
    ["联系人", "contactName"],
    ["联系电话", "contactPhone"],
    ["联系微信", "contactWechat"],
    ["出发地址", "pickupAddress"],
    ["订单金额", "amount"],
    ["派发金额", "dispatchAmount"],
    ["供应商名称", "supplierName"],
    ["供应商账号", "supplierAccount"],
    ["司机姓名", "assignedDriverName"],
    ["司机账号", "assignedDriverAccount"],
    ["创建时间", "createdAt"],
  ];

  const thead = `<tr>${headerMap.map(([title]) => `<th>${escapeExcelCell(title)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((row) => `<tr>${headerMap.map(([, key]) => `<td>${escapeExcelCell(row[key])}</td>`).join("")}</tr>`)
    .join("");

  downloadExcelHtml(filenamePrefix, thead, tbody);
  showToast(`已导出 ${orders.length} 条订单`);
}

function exportAccountQueryToExcel(users, filter, filenamePrefix) {
  if (!users.length) {
    showToast("暂无可导出的账号数据");
    return;
  }

  const rows = users.map((user, index) => {
    const matchedOrders = getOrdersByUser(user.id);
    const orderNos = matchedOrders.map((order) => order.orderNo).filter(Boolean);
    const dates = Array.from(new Set(matchedOrders.map((order) => order.travelDate).filter(Boolean)));
    return {
      index: index + 1,
      account: user.account || "-",
      role: getRoleLabel(user.role),
      driverName: user.driverName || "-",
      phone: user.phone || "-",
      enabled: getUserAccountStatusText(user),
      matchedCount: matchedOrders.length,
      matchedOrderNos: orderNos.length ? orderNos.join(" / ") : "-",
      matchedDates: dates.length ? dates.join(" / ") : "-",
    };
  });

  const headerMap = [
    ["序号", "index"],
    ["账号", "account"],
    ["角色", "role"],
    ["姓名", "driverName"],
    ["手机号", "phone"],
    ["状态", "enabled"],
    ["匹配订单数", "matchedCount"],
    ["匹配订单号", "matchedOrderNos"],
    ["匹配日期", "matchedDates"],
  ];

  const thead = `<tr>${headerMap.map(([title]) => `<th>${escapeExcelCell(title)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((row) => `<tr>${headerMap.map(([, key]) => `<td>${escapeExcelCell(row[key])}</td>`).join("")}</tr>`)
    .join("");

  downloadExcelHtml(filenamePrefix, thead, tbody);
  showToast(`已导出 ${users.length} 条账号记录`);
}

function renderOrderSearchBar(viewKey) {
  const filter = getOrderSearchState(viewKey);
  const isAccountQuery = viewKey === "account-query";
  const isDispatchCenter = viewKey === "dispatch-center";
  const roleOptions = USER_ROLES.map(
    (role) => `<option value="${role.key}" ${filter.role === role.key ? "selected" : ""}>${role.label}</option>`
  ).join("");
  const roleSelect = isAccountQuery
    ? `<select id="search-role-${viewKey}"><option value="">全部角色</option>${roleOptions}</select>`
    : "";
  const orderStatusOptions = ORDER_STATUS_OPTIONS.map(
    (status) =>
      `<option value="${status.key}" ${filter.status === status.key ? "selected" : ""}>${status.label}</option>`
  ).join("");
  const accountStatusOptions = ACCOUNT_STATUS_OPTIONS.map(
    (status) =>
      `<option value="${status.key}" ${filter.status === status.key ? "selected" : ""}>${status.label}</option>`
  ).join("");
  const statusSelect = isDispatchCenter
    ? `<select id="search-status-${viewKey}"><option value="">全部状态</option>${orderStatusOptions}</select>`
    : isAccountQuery
      ? `<select id="search-status-${viewKey}"><option value="">全部状态</option>${accountStatusOptions}</select>`
      : "";
  const dateInput = isAccountQuery
    ? ""
    : `<input id="search-order-date-${viewKey}" type="date" value="${escapeHtml(filter.date)}" />`;
  const keywordPlaceholder = isAccountQuery ? "按账号名搜索" : "按订单号搜索";
  return `
    <div class="order-search-bar ${isAccountQuery ? "account-query-search" : ""}">
      <input id="search-order-no-${viewKey}" placeholder="${keywordPlaceholder}" value="${escapeHtml(filter.orderNo)}" />
      ${dateInput}
      ${roleSelect}
      ${statusSelect}
      <button class="btn btn-soft" type="button" data-order-search="${viewKey}">搜索</button>
      <button class="btn btn-outline" type="button" data-order-reset="${viewKey}">重置</button>
      <button class="btn btn-primary" type="button" data-order-export="${viewKey}">导出表格</button>
    </div>
  `;
}

function getFilteredOrdersForView(viewKey) {
  const filter = getOrderSearchState(viewKey);
  if (viewKey === "orders") {
    return applyOrderSearchFilter(getCurrentUserOrders(), filter);
  }
  if (viewKey === "dispatch-center") {
    return applyOrderSearchFilter(
      getOrderSupplierOrders().filter((order) => order.status !== "cancelled"),
      filter
    );
  }
  if (viewKey === "my-tasks") {
    return applyOrderSearchFilter(
      STATE.orders.filter(
        (order) => order.assignedDriverId === STATE.currentUser?.id && order.status !== "cancelled"
      ),
      filter
    );
  }
  return [];
}

function getCurrentUserOrders() {
  if (!STATE.currentUser) return [];
  return STATE.orders.filter((o) => o.userId === STATE.currentUser.id);
}

function getCurrentUserSettlementOrders() {
  if (!STATE.currentUser) return [];
  const role = normalizeRole(STATE.currentUser.role);
  const isCompleted = (order) => String(order?.status || "") === "completed";
  if (role === "driver") {
    return STATE.orders.filter(
      (order) => order.assignedDriverId === STATE.currentUser.id && isCompleted(order)
    );
  }
  if (role === "supplier") {
    return getCurrentUserOrders().filter(isCompleted);
  }
  if (role === "admin") {
    return STATE.orders.filter(isCompleted);
  }
  return [];
}

function getSettlementRecordTypeByRole(role) {
  if (role === "driver") return "接单";
  if (role === "supplier") return "下单";
  if (role === "admin") return "平台";
  return "统计";
}

function getSettlementSupplierAccount(order) {
  const owner = getOrderOwner(order);
  return order.createdByAccount || owner?.account || "-";
}

function getSettlementDriverAccount(order) {
  return order.assignedDriverAccount || "-";
}

function getSettlementAmountValue(order, role) {
  if (role === "driver" || role === "admin") {
    return getOrderDispatchAmount(order);
  }
  return Number(order?.totalAmount || 0);
}

function formatSettlementRecordAmount(order, role) {
  const amount = getSettlementAmountValue(order, role);
  if (role === "driver" || role === "admin") {
    return formatSettlementMoney(amount, order.currency);
  }
  return formatMoney(amount, order.currency);
}

function getFilteredSettlementOrders() {
  const { startDate, endDate } = STATE.settlementFilter;
  return getCurrentUserSettlementOrders().filter((order) => {
    const travelDate = String(order.travelDate || "");
    if (startDate && (!travelDate || travelDate < startDate)) return false;
    if (endDate && (!travelDate || travelDate > endDate)) return false;
    return true;
  });
}

function exportSettlementToExcel(orders, role, filenamePrefix) {
  if (!orders.length) {
    showToast("暂无可导出的结算统计数据");
    return;
  }

  const showOrderAmount = role === "supplier" || role === "admin";
  const showComputedAmount = role === "driver" || role === "admin";
  const showAdminAccounts = role === "admin";
  const rows = orders.map((order, index) => ({
    index: index + 1,
    orderNo: order.orderNo || "-",
    recordType: getSettlementRecordTypeByRole(role),
    status: getOrderStatusText(order.status),
    travelDate: order.travelDate || "-",
    productName: order.productName || "-",
    vehicleLabel: order.vehicleLabel || "-",
    orderAmount: formatMoney(order.totalAmount, order.currency),
    settlementAmount: formatSettlementRecordAmount(order, role),
    supplierAccount: getSettlementSupplierAccount(order),
    driverAccount: getSettlementDriverAccount(order),
    createdAt: order.createdAt || "-",
  }));

  const amountHeaders = [];
  if (showOrderAmount) amountHeaders.push(["订单金额", "orderAmount"]);
  if (showComputedAmount) amountHeaders.push(["计算金额", "settlementAmount"]);

  const headerMap = [
    ["序号", "index"],
    ["订单号", "orderNo"],
    ["统计类型", "recordType"],
    ["状态", "status"],
    ["出行日期", "travelDate"],
    ["产品", "productName"],
    ["车型", "vehicleLabel"],
    ...amountHeaders,
    ...(showAdminAccounts ? [["供应商账号", "supplierAccount"], ["司机账号", "driverAccount"]] : []),
    ["创建时间", "createdAt"],
  ];

  const thead = `<tr>${headerMap.map(([title]) => `<th>${escapeExcelCell(title)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((row) => `<tr>${headerMap.map(([, key]) => `<td>${escapeExcelCell(row[key])}</td>`).join("")}</tr>`)
    .join("");

  downloadExcelHtml(filenamePrefix, thead, tbody);
  showToast(`已导出 ${orders.length} 条结算统计记录`);
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.valueOf())) return dateStr;
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatMoney(value, currency) {
  const val = Number(value) || 0;
  if ((currency || "").toUpperCase() === "RMB") {
    return `RMB ${Math.round(val)}`;
  }
  return `${currency || "AUD"} ${val.toFixed(2)}`;
}

function createOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD${y}${m}${d}${random}`;
}

function renderAuthView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container">
      <div class="card auth-wrap">
        <h2 class="auth-title">考拉拉专车管理系统</h2>
        <div class="auth-tabs">
          <button class="tab-btn ${STATE.authMode === "login" ? "active" : ""}" data-auth-tab="login">登录</button>
          <button class="tab-btn ${STATE.authMode === "register" ? "active" : ""}" data-auth-tab="register">司导注册</button>
        </div>
        <form id="auth-form">
          <div class="field">
            <label>账号（用户名或手机号）</label>
            <input id="account" required />
          </div>
          <div class="field">
            <label>密码</label>
            <input id="password" type="password" required />
          </div>
          ${
            STATE.authMode === "register"
              ? `
                <div class="field">
                  <label>司机姓名（必填）</label>
                  <input id="driver-name" required />
                </div>
                <div class="field">
                  <label>手机号（必填，可用于登录）</label>
                  <input id="phone" required />
                </div>
                <div class="field">
                  <label>驾照号码（选填）</label>
                  <input id="license-no" />
                </div>
                <div class="field">
                  <label>昵称（选填）</label>
                  <input id="nickname" />
                </div>
              `
              : ""
          }
          <button class="btn btn-primary" style="width:100%" type="submit">
            ${STATE.authMode === "login" ? "登录" : "提交注册"}
          </button>
          <p class="hint" style="margin-top:10px">如需注册供应商，请联系管理员</p>
        </form>
      </div>
    </div>
    <footer class="app-footer app-footer-standalone">${APP_COPYRIGHT}</footer>
  `;

  app.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      STATE.authMode = btn.dataset.authTab;
      render();
    });
  });

  app.querySelector("#auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountInput = app.querySelector("#account").value.trim();
    const password = app.querySelector("#password").value.trim();

    if (!accountInput || !password) {
      showToast("请输入账号和密码");
      return;
    }

    if (STATE.authMode === "login") {
      if (CLOUD_SYNC_ENABLED) {
        try {
          await refreshUsersFromCloudForLogin({ strict: true });
        } catch (error) {
          console.error(error);
          showToast("云端账号同步失败，请稍后重试");
          return;
        }
      }

      let user = findUserByCredentials(accountInput, password);

      if (!user) {
        showToast("账号或密码错误");
        return;
      }
      if (normalizeReviewStatus(user.reviewStatus) !== "approved") {
        showToast("账号待审核，请联系管理员审核通过后登录");
        return;
      }
      if (user.enabled === false) {
        showToast("账号已被禁用，请联系管理员");
        return;
      }
      STATE.currentUser = user;
      ensureActiveViewAllowed();
      persist();
      render();
      showToast(`欢迎回来：${user.nickname || user.account}`);
      return;
    }

    const account = accountInput;
    const driverName = app.querySelector("#driver-name").value.trim();
    const phone = sanitizePhone(app.querySelector("#phone").value);
    const licenseNo = app.querySelector("#license-no").value.trim();
    const nicknameInput = app.querySelector("#nickname").value.trim();
    const nickname = nicknameInput || driverName;

    if (!driverName || !phone) {
      showToast("司机姓名和手机号为必填项");
      return;
    }
    if (!isValidPhone(phone)) {
      showToast("手机号格式不正确");
      return;
    }
    if (STATE.users.some((u) => u.account === account)) {
      showToast("账号已存在");
      return;
    }
    if (STATE.users.some((u) => u.phone && u.phone === phone)) {
      showToast("手机号已被使用");
      return;
    }

    const user = {
      id: `U${Date.now()}`,
      account,
      password,
      nickname,
      driverName,
      phone,
      licenseNo,
      licenseImage: "",
      companyName: "",
      companyContact: "",
      companyPhone: "",
      companyAddress: "",
      businessScope: "",
      homeAddress: "",
      vehicleModel: "",
      vehiclePlate: "",
      vehicleSeats: "",
      vehicleDesc: "",
      enabled: false,
      reviewStatus: "pending",
      role: "driver",
      permissions: getDefaultPermissionsByRole("driver"),
    };

    STATE.users.unshift(user);
    STATE.currentUser = null;
    STATE.authMode = "login";
    persist();
    render();
    showToast("注册成功，账号待审核，请联系管理员审核通过后登录");
  });
}

function getDashboardStats() {
  const orders = getCurrentUserOrders();
  const pending = orders.filter((o) => o.status === "pending").length;
  const totalAmount = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  return {
    orderCount: orders.length,
    pendingCount: pending,
    totalAmount,
  };
}

function renderProductsPanel() {
  if (!STATE.products.length) {
    return `
      <div class="toolbar">
        <h2>可预订产品</h2>
        <div class="hint">选择产品、日期和车型，确认页将显示最终价格。</div>
      </div>
      <div class="empty">暂无可预订产品。</div>
    `;
  }

  const pageInfo = paginateRecords(STATE.products, "products");
  const cards = pageInfo.records
    .map((product) => {
      const minPrice = getMinVehiclePrice(product);
      const vehicleCount = getProductVehicleOptions(product).length;
      return `
      <article class="product-card">
        <h4>${escapeHtml(product.name)}</h4>
        <p>${escapeHtml(product.desc)}</p>
        <div class="meta">
          <span class="price">${formatMoney(minPrice, product.currency)} / 车</span>
          <span class="remaining">可选车型：${vehicleCount}</span>
        </div>
        <div class="tags">${product.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="hint" style="margin-bottom:10px">支持选择出行日期，价格会随车型自动更新。</div>
        <button class="btn btn-primary" type="button" data-book-product="${product.id}">立即预订</button>
      </article>
    `;
    })
    .join("");

  return `
    <div class="toolbar">
      <h2>可预订产品</h2>
      <div class="hint">选择产品、日期和车型，确认页将显示最终价格。</div>
    </div>
    <div class="products">${cards}</div>
    ${renderPagination("products", pageInfo)}
  `;
}

function renderOrdersPanel() {
  const allOrders = getCurrentUserOrders();
  const orders = getFilteredOrdersForView("orders");
  const searchBar = renderOrderSearchBar("orders");
  if (!allOrders.length) {
    return `${searchBar}<div class="empty">暂无订单，请先到“可预订产品”下单。</div>`;
  }
  if (!orders.length) {
    return `${searchBar}<div class="empty">未匹配到订单，请更换订单号或日期后重试。</div>`;
  }

  const pageInfo = paginateRecords(orders, "orders");
  const list = pageInfo.records
    .map((order) => {
      const statusText = getOrderStatusText(order.status);
      return `
        <article class="order-card">
          <div class="order-head">
            <div>
              <div><b>${escapeHtml(order.orderNo)}</b></div>
              <div class="hint">创建时间：${escapeHtml(order.createdAt || "-")}</div>
            </div>
            <span class="status ${order.status}">${statusText}</span>
          </div>
          <div class="hint" style="margin-bottom:8px">产品：<b>${escapeHtml(order.productName)}</b> ｜ 日期：<b>${formatDate(order.travelDate)}</b> ｜ 车型：<b>${escapeHtml(order.vehicleLabel || "-")}</b> ｜ 人数：<b>${order.travelers}</b></div>
          <div class="hint" style="margin-bottom:8px">联系人：${escapeHtml(order.contactName)} ｜ ${escapeHtml(order.contactPhone)}</div>
          ${order.contactWechat ? `<div class="hint" style="margin-bottom:8px">微信：${escapeHtml(order.contactWechat)}</div>` : ""}
          ${order.pickupAddress ? `<div class="hint" style="margin-bottom:8px">上车点：${escapeHtml(order.pickupAddress)}</div>` : ""}
          <div class="meta" style="margin-bottom:0">
            <span class="price">订单金额：${formatMoney(order.totalAmount, order.currency)}</span>
            ${order.status === "pending" ? `<button class="btn btn-danger" data-cancel-order="${order.id}" type="button">取消订单</button>` : `<span class="hint">当前状态不可取消</span>`}
          </div>
        </article>
      `;
    })
    .join("");

  return `${searchBar}<div class="orders">${list}</div>${renderPagination("orders", pageInfo)}`;
}

function renderDispatchCenterPanel() {
  const supplierOrders = getOrderSupplierOrders().filter((order) => order.status !== "cancelled");
  const filteredOrders = getFilteredOrdersForView("dispatch-center");
  const searchBar = renderOrderSearchBar("dispatch-center");
  if (!supplierOrders.length) {
    return `${searchBar}<div class="empty">暂无可派发的供应商订单。</div>`;
  }
  if (!filteredOrders.length) {
    return `${searchBar}<div class="empty">未匹配到订单，请更换订单号或日期后重试。</div>`;
  }

  const drivers = getDriverUsers();
  const pageInfo = paginateRecords(filteredOrders, "dispatch-center");
  const cards = pageInfo.records
    .map((order) => {
      const owner = getOrderOwner(order);
      const supplierName = order.createdByName || owner?.driverName || owner?.nickname || "-";
      const supplierAccount = order.createdByAccount || owner?.account || "-";
      const selectedDriverId = order.assignedDriverId || "";
      const selectedDriver = getUserById(selectedDriverId) || drivers.find((driver) => driver.id === selectedDriverId) || null;
      const canDispatch = order.status === "pending" || order.status === "dispatched";
      const dispatchAmount = getOrderDispatchAmount(order);

      return `
        <article class="order-card">
          <div class="order-head">
            <div>
              <div><b>${escapeHtml(order.orderNo)}</b></div>
              <div class="hint">创建时间：${escapeHtml(order.createdAt || "-")}</div>
            </div>
            <span class="status ${escapeHtml(order.status)}">${getOrderStatusText(order.status)}</span>
          </div>
          <div class="hint" style="margin-bottom:8px">供应商：<b>${escapeHtml(supplierName)}</b>（${escapeHtml(supplierAccount)}）</div>
          <div class="hint" style="margin-bottom:8px">产品：<b>${escapeHtml(order.productName)}</b> ｜ 日期：<b>${formatDate(order.travelDate)}</b> ｜ 车型：<b>${escapeHtml(order.vehicleLabel || "-")}</b></div>
          <div class="hint" style="margin-bottom:8px">联系人：${escapeHtml(order.contactName)} ｜ ${escapeHtml(order.contactPhone)} ｜ 订单金额：${formatMoney(order.totalAmount, order.currency)}</div>
          <div class="hint" style="margin-bottom:8px">派发结算价：<b>${formatSettlementMoney(dispatchAmount, order.currency)}</b></div>
          ${order.contactWechat || order.pickupAddress ? `<div class="hint" style="margin-bottom:10px">${order.contactWechat ? `微信：${escapeHtml(order.contactWechat)}` : ""}${order.contactWechat && order.pickupAddress ? " ｜ " : ""}${order.pickupAddress ? `上车点：${escapeHtml(order.pickupAddress)}` : ""}</div>` : ""}
          <div class="hint" style="margin-bottom:10px">当前司机：${escapeHtml(selectedDriver?.driverName || order.assignedDriverName || "未派发")}</div>

          <div class="dispatch-row">
            <select id="dispatch-driver-${escapeHtml(order.id)}" ${!drivers.length ? "disabled" : ""}>
              ${drivers.length ? drivers.map((driver) => {
                const selectedAttr = driver.id === selectedDriverId ? "selected" : "";
                return `<option value="${escapeHtml(driver.id)}" ${selectedAttr}>${escapeHtml(driver.driverName || driver.nickname || driver.account)} (${escapeHtml(driver.account)})</option>`;
              }).join("") : '<option value="">暂无可用司机</option>'}
            </select>
            <input id="dispatch-price-${escapeHtml(order.id)}" class="dispatch-price-input" type="number" min="0.01" step="0.01" value="${escapeHtml(formatDispatchAmountInput(dispatchAmount))}" ${!canDispatch || !drivers.length ? "disabled" : ""} title="默认按订单金额的 85%，可手工修改" />
            <button class="btn btn-primary" type="button" data-dispatch-order="${escapeHtml(order.id)}" ${!canDispatch || !drivers.length ? "disabled" : ""}>${order.status === "dispatched" ? "重新派发" : "确认派发"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="toolbar">
      <h2>订单分配中心</h2>
      <div class="hint">将供应商订单派发给司机，默认派发金额为订单金额的 85%，支持手工修改。</div>
    </div>
    ${searchBar}
    <div class="orders">${cards}</div>
    ${renderPagination("dispatch-center", pageInfo)}
  `;
}

function renderMyTasksPanel() {
  const allTasks = STATE.orders.filter((order) => order.assignedDriverId === STATE.currentUser?.id && order.status !== "cancelled");
  const tasks = getFilteredOrdersForView("my-tasks");
  const searchBar = renderOrderSearchBar("my-tasks");
  if (!allTasks.length) {
    return `${searchBar}<div class="empty">暂无已派发任务。</div>`;
  }
  if (!tasks.length) {
    return `${searchBar}<div class="empty">未匹配到任务，请更换订单号或日期后重试。</div>`;
  }

  const pageInfo = paginateRecords(tasks, "my-tasks");
  const cards = pageInfo.records
    .map((order) => {
      const canCompleteNow = isServiceDateOnOrBeforeToday(order.travelDate);
      return `
        <article class="order-card task-card" data-open-task="${escapeHtml(order.id)}">
          <div class="order-head">
            <div><div><b>${escapeHtml(order.orderNo)}</b></div><div class="hint">派发时间：${escapeHtml(order.dispatchedAt || "-")}</div></div>
            <span class="status ${escapeHtml(order.status)}">${getOrderStatusText(order.status)}</span>
          </div>
          <div class="hint" style="margin-bottom:8px">产品：<b>${escapeHtml(order.productName)}</b> ｜ 日期：<b>${formatDate(order.travelDate)}</b> ｜ 车型：<b>${escapeHtml(order.vehicleLabel || "-")}</b></div>
          <div class="hint" style="margin-bottom:8px">联系人：${escapeHtml(order.contactName || "-")} ｜ ${escapeHtml(order.contactPhone || "-")}</div>
          ${order.contactWechat || order.pickupAddress ? `<div class="hint" style="margin-bottom:8px">${order.contactWechat ? `微信：${escapeHtml(order.contactWechat)}` : ""}${order.contactWechat && order.pickupAddress ? " ｜ " : ""}${order.pickupAddress ? `上车点：${escapeHtml(order.pickupAddress)}` : ""}</div>` : ""}
          <div class="hint" style="margin-bottom:0">${canCompleteNow ? "已到服务日期，可完成任务" : "未到服务日期，暂不可完成任务"}</div>
          <div class="hint" style="margin-top:6px;color:#2f5f93">点击卡片可查看任务详情</div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="toolbar"><h2>我的任务</h2><div class="hint">管理员派发的任务会显示在此，可进入详情确认或完成。</div></div>
    ${searchBar}
    <div class="orders">${cards}</div>
    ${renderPagination("my-tasks", pageInfo)}
  `;
}

function renderSettlementReportPanel() {
  const role = normalizeRole(STATE.currentUser?.role);
  const filter = STATE.settlementFilter || { startDate: "", endDate: "" };
  const allRecords = getCurrentUserSettlementOrders();
  const records = getFilteredSettlementOrders();
  const showOrderAmount = role === "supplier" || role === "admin";
  const showComputedAmount = role === "driver" || role === "admin";
  const showAdminAccounts = role === "admin";
  const currency = allRecords.find((order) => order.currency)?.currency || "RMB";
  const totalOrderAmount = records.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const totalSettlementAmount = records.reduce(
    (sum, order) => sum + getSettlementAmountValue(order, role),
    0
  );

  const summaryTags = [
    `统计订单：${records.length}`,
    ...(showOrderAmount ? [`订单总额：${formatMoney(totalOrderAmount, currency)}`] : []),
    ...(showComputedAmount ? [`计算总额：${formatSettlementMoney(totalSettlementAmount, currency)}`] : []),
    filter.startDate || filter.endDate
      ? `日期范围：${filter.startDate || "不限"} 至 ${filter.endDate || "不限"}`
      : "日期范围：不限",
  ];

  const searchBar = `
    <div class="order-search-bar settlement-search-bar">
      <input id="settlement-start-date" type="date" value="${escapeHtml(filter.startDate || "")}" />
      <input id="settlement-end-date" type="date" value="${escapeHtml(filter.endDate || "")}" />
      <button class="btn btn-soft" type="button" id="settlement-search-btn">查询</button>
      <button class="btn btn-outline" type="button" id="settlement-reset-btn">重置</button>
      <button class="btn btn-primary" type="button" id="settlement-export-btn">导出表格</button>
    </div>
  `;

  if (!allRecords.length) {
    return `
      <div class="toolbar">
        <h2>结算统计</h2>
        <div class="hint">仅统计已完成订单，支持按出行日期范围筛选。</div>
      </div>
      ${searchBar}
      <div class="empty">当前账号暂无可统计订单。</div>
    `;
  }

  if (!records.length) {
    return `
      <div class="toolbar">
        <h2>结算统计</h2>
        <div class="hint">仅统计已完成订单，支持按出行日期范围筛选。</div>
      </div>
      ${searchBar}
      <div class="empty">当前日期范围内暂无结算数据。</div>
    `;
  }

  const pageInfo = paginateRecords(records, "settlement-report");
  const rows = pageInfo.records
    .map((order, index) => {
      return `
        <tr>
          <td class="col-index">${pageInfo.startIndex + index + 1}</td>
          <td class="col-order-no">${escapeHtml(order.orderNo || "-")}</td>
          <td class="col-type">${escapeHtml(getSettlementRecordTypeByRole(role))}</td>
          <td class="col-status"><span class="status ${escapeHtml(order.status || "")}">${escapeHtml(getOrderStatusText(order.status))}</span></td>
          <td class="col-date">${escapeHtml(formatDate(order.travelDate || "-"))}</td>
          <td class="col-product">${escapeHtml(order.productName || "-")}</td>
          <td class="col-vehicle">${escapeHtml(order.vehicleLabel || "-")}</td>
          ${showOrderAmount ? `<td class="col-amount">${escapeHtml(formatMoney(order.totalAmount, order.currency))}</td>` : ""}
          ${showComputedAmount ? `<td class="col-amount">${escapeHtml(formatSettlementRecordAmount(order, role))}</td>` : ""}
          ${showAdminAccounts ? `<td class="col-account">${escapeHtml(getSettlementSupplierAccount(order))}</td>` : ""}
          ${showAdminAccounts ? `<td class="col-account">${escapeHtml(getSettlementDriverAccount(order))}</td>` : ""}
          <td class="col-created">${escapeHtml(order.createdAt || "-")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="toolbar">
      <h2>结算统计</h2>
      <div class="hint">仅统计已完成订单，支持按出行日期范围筛选。</div>
    </div>
    ${searchBar}
    <div class="account-query-summary">
      ${summaryTags.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
    <div class="account-table-wrap">
      <table class="account-table settlement-table">
        <thead>
          <tr>
            <th class="col-index">#</th>
            <th class="col-order-no">订单号</th>
            <th class="col-type">统计类型</th>
            <th class="col-status">状态</th>
            <th class="col-date">出行日期</th>
            <th class="col-product">产品</th>
            <th class="col-vehicle">车型</th>
            ${showOrderAmount ? `<th class="col-amount">订单金额</th>` : ""}
            ${showComputedAmount ? `<th class="col-amount">计算金额</th>` : ""}
            ${showAdminAccounts ? `<th class="col-account">供应商账号</th>` : ""}
            ${showAdminAccounts ? `<th class="col-account">司机账号</th>` : ""}
            <th class="col-created">创建时间</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderPagination("settlement-report", pageInfo)}
  `;
}

function renderUserPermissionsPanel() {
  const activeRole = normalizeRole(STATE.addUserRoleView, "supplier");
  const defaultRolePermissions = getDefaultPermissionsByRole(activeRole);
  const rolePermissionFixed = isRolePermissionFixed(activeRole);
  const roleNameLabelMap = {
    supplier: "联系人（必填）",
    driver: "司机姓名（必填）",
    admin: "管理员姓名（必填）",
  };
  const rolePageTitleMap = {
    supplier: "供应商账号信息",
    driver: "司机账号信息",
    admin: "管理员账号信息",
  };

  const roleTabs = USER_ROLES.map(
    (role) => `
      <button class="tab-btn ${activeRole === role.key ? "active" : ""}" type="button" data-role-tab="${role.key}">
        ${rolePageTitleMap[role.key]}
      </button>
    `
  ).join("");

  const newUserPerms = MENU_ITEMS.map(
    (item) => `
      <label class="perm-option">
        <input type="checkbox" name="new-user-permission" value="${item.key}" ${defaultRolePermissions.includes(item.key) ? "checked" : ""} ${rolePermissionFixed ? "disabled" : ""} />
        <span>${item.label}</span>
      </label>
    `
  ).join("");

  let extraIdentityFields = "";
  if (activeRole === "supplier") {
    extraIdentityFields = `
      <div class="permission-grid">
        <div class="field">
          <label>公司名（必填）</label>
          <input id="new-company-name" required />
        </div>
        <div class="field">
          <label>昵称（选填）</label>
          <input id="new-nickname" />
        </div>
      </div>
    `;
  } else if (activeRole === "driver") {
    extraIdentityFields = `
      <div class="permission-grid">
        <div class="field">
          <label>驾照号码</label>
          <input id="new-license-no" />
        </div>
        <div class="field">
          <label>昵称（选填）</label>
          <input id="new-nickname" />
        </div>
      </div>
    `;
  }

  return `
    <div class="toolbar">
      <h2>\u65b0\u589e\u8d26\u53f7</h2>
      <div class="hint">先选择角色，再填写账号信息；手机号可用于登录。</div>
    </div>

    <section class="permission-layout single-panel">
      <article class="card permission-card">
        <div class="auth-tabs role-switch-tabs">${roleTabs}</div>
        <h3>${rolePageTitleMap[activeRole]}</h3>
        <form id="create-user-form">
          <input id="new-role" value="${activeRole}" hidden />

          <div class="permission-grid">
            <div class="field">
              <label>登录账号（必填）</label>
              <input id="new-account" required />
            </div>
            <div class="field">
              <label>登录密码（必填）</label>
              <input id="new-password" type="password" required />
            </div>
          </div>

          <div class="permission-grid">
            <div class="field">
              <label>${roleNameLabelMap[activeRole]}</label>
              <input id="new-driver-name" required />
            </div>
            <div class="field">
              <label>手机号（必填，可登录）</label>
              <input id="new-phone" required />
            </div>
          </div>

          ${extraIdentityFields}

          <div class="field">
            <label>${activeRole === "driver" ? "驾照图片" : "证件图片"}</label>
            <input id="new-license-image" type="file" accept="image/*" />
            <div class="hint">建议 JPG/PNG，大小不超过 5MB。</div>
          </div>

          <div class="field">
            <label>菜单权限</label>
            <div class="permission-options">${newUserPerms}</div>
            <div class="hint">${rolePermissionFixed ? "该角色权限固定，不可调整。" : "可按需勾选账号可用菜单。"}</div>
          </div>

          <button class="btn btn-primary" type="submit" style="width:100%">创建账号</button>
        </form>
      </article>
    </section>
  `;
}

function renderAccountQueryPanel() {
  const filter = getOrderSearchState("account-query");
  const searchBar = renderOrderSearchBar("account-query");
  const users = getFilteredUsersForAccountQuery();
  const totalAccounts = STATE.users.length;
  const pendingAccounts = users.filter((user) => getUserAccountStatusKey(user) === "pending").length;
  const disabledAccounts = users.filter((user) => getUserAccountStatusKey(user) === "disabled").length;
  const filterTags = [
    filter.orderNo ? `账号：${filter.orderNo}` : "",
    filter.role && USER_ROLES.some((item) => item.key === filter.role) ? `角色：${getRoleLabel(filter.role)}` : "",
    filter.status && ACCOUNT_STATUS_OPTIONS.some((item) => item.key === filter.status)
      ? `状态：${ACCOUNT_STATUS_OPTIONS.find((item) => item.key === filter.status)?.label || filter.status}`
      : "",
  ].filter(Boolean);

  if (!users.length) {
    return `
      <div class="toolbar">
        <h2>\u8d26\u53f7\u67e5\u8be2</h2>
        <div class="hint">支持按账号、角色、状态筛选；点击详情可查看完整账号资料与证件图片。</div>
      </div>
      ${searchBar}
      <div class="empty">当前筛选条件下暂无匹配账号。</div>
    `;
  }

  const pageInfo = paginateRecords(users, "account-query");
  const rows = pageInfo.records
    .map((user, index) => {
      const statusText = getUserAccountStatusText(user);
      const statusKey = getUserAccountStatusKey(user);
      const isCurrentUser = STATE.currentUser && STATE.currentUser.id === user.id;
      const canApprove = statusKey === "pending";
      const canToggleEnabled = !isCurrentUser && statusKey !== "pending";
      const toggleLabel = statusKey === "pending" ? "待审核" : (user.enabled === false ? "启用账号" : "禁用账号");
      const approveButton = canApprove
        ? `<button class="btn btn-soft btn-xs" type="button" data-approve-user="${escapeHtml(user.id)}">审核通过</button>`
        : "";

      return `
        <tr>
          <td class="col-index">${pageInfo.startIndex + index + 1}</td>
          <td class="col-account">${escapeHtml(user.account || "-")}</td>
          <td class="col-role">${escapeHtml(getRoleLabel(user.role))}</td>
          <td class="col-name">${escapeHtml(user.driverName || "-")}</td>
          <td class="col-phone">${escapeHtml(user.phone || "-")}</td>
          <td class="col-status"><span class="status ${getUserAccountStatusClass(user)}">${statusText}</span></td>
          <td class="col-actions">
            <div class="table-actions">
              <button class="btn btn-primary btn-xs" type="button" data-view-user-detail="${escapeHtml(user.id)}">详情</button>
              ${approveButton}
              <button class="btn btn-soft btn-xs" type="button" data-reset-password="${escapeHtml(user.id)}">重置密码</button>
              <button class="btn btn-soft btn-xs" type="button" data-toggle-user-enabled="${escapeHtml(user.id)}" ${canToggleEnabled ? "" : "disabled"}>${toggleLabel}</button>
              <button class="btn btn-danger btn-xs" type="button" data-delete-user="${escapeHtml(user.id)}" ${isCurrentUser ? "disabled" : ""}>删除账号</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="toolbar">
      <h2>\u8d26\u53f7\u67e5\u8be2</h2>
      <div class="hint">按账号/角色/状态筛选；待审核账号需先点击“审核通过”后才能启用登录。</div>
    </div>
    ${searchBar}
    <div class="account-query-summary">
      <span>筛选结果：<b>${users.length}</b> / ${totalAccounts}</span>
      <span>待审核：<b>${pendingAccounts}</b></span>
      <span>禁用账号：<b>${disabledAccounts}</b></span>
      <span>${filterTags.length ? `当前筛选：${escapeHtml(filterTags.join(" ｜ "))}` : "当前筛选：无"}</span>
    </div>

    <div class="account-table-wrap">
      <table class="account-table">
        <thead>
          <tr>
            <th class="col-index">#</th>
            <th class="col-account">账号</th>
            <th class="col-role">角色</th>
            <th class="col-name">姓名</th>
            <th class="col-phone">手机号</th>
            <th class="col-status">状态</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderPagination("account-query", pageInfo)}
  `;
}

function openAccountDetailModal(userId) {
  const user = getUserById(userId);
  if (!user) {
    showToast("账号不存在，请刷新后重试");
    return;
  }

  const role = normalizeRole(user.role);
  const roleLabel = getRoleLabel(role);
  const statusText = getUserAccountStatusText(user);
  const roleLicenseLabel = role === "driver" ? "驾照号码" : "证件/参考编号";
  const permissionOptions = MENU_ITEMS.map(
    (item) => `
      <label class="perm-option account-detail-perm-option">
        <input type="checkbox" name="detail-permission" value="${item.key}" ${hasPermission(user, item.key) ? "checked" : ""} />
        <span>${item.label}</span>
      </label>
    `
  ).join("");
  const roleExtraFields =
    role === "supplier"
      ? `
        <div class="field"><label>公司名称</label><input value="${escapeHtml(user.companyName || "-")}" readonly /></div>
        <div class="grid">
          <div class="field"><label>公司联系人</label><input value="${escapeHtml(user.companyContact || "-")}" readonly /></div>
          <div class="field"><label>公司电话</label><input value="${escapeHtml(user.companyPhone || "-")}" readonly /></div>
        </div>
        <div class="field"><label>公司地址</label><input value="${escapeHtml(user.companyAddress || "-")}" readonly /></div>
        <div class="field"><label>业务范围</label><textarea readonly>${escapeHtml(user.businessScope || "-")}</textarea></div>
      `
      : role === "driver"
        ? `
          <div class="grid">
            <div class="field"><label>住址</label><input value="${escapeHtml(user.homeAddress || "-")}" readonly /></div>
            <div class="field"><label>座位数</label><input value="${escapeHtml(user.vehicleSeats || "-")}" readonly /></div>
          </div>
          <div class="grid">
            <div class="field"><label>车辆型号</label><input value="${escapeHtml(user.vehicleModel || "-")}" readonly /></div>
            <div class="field"><label>车牌号</label><input value="${escapeHtml(user.vehiclePlate || "-")}" readonly /></div>
          </div>
          <div class="field"><label>车辆备注</label><input value="${escapeHtml(user.vehicleDesc || "-")}" readonly /></div>
        `
        : "";

  const normalizedLicenseImage = String(user.licenseImage || "").trim();
  const hasLicenseImage = Boolean(normalizedLicenseImage && normalizedLicenseImage !== "-");
  const licenseImageSection = hasLicenseImage
    ? `<img id="account-detail-image-preview" class="account-detail-image" src="${escapeHtml(normalizedLicenseImage)}" alt="证件图片" />`
    : `<div class="hint">未上传证件图片</div>`;

  const content = document.getElementById("account-detail-content");
  if (!content) return;
  content.innerHTML = `
    <form id="account-detail-form" class="account-detail-form">
      <div class="account-detail-body">
      <div class="grid">
        <div class="field"><label>账号</label><input value="${escapeHtml(user.account || "-")}" readonly /></div>
        <div class="field"><label>登录密码</label><input value="${escapeHtml(user.password || "-")}" readonly /></div>
      </div>
      <div class="grid">
        <div class="field"><label>角色</label><input value="${escapeHtml(roleLabel)}" readonly /></div>
        <div class="field"><label>手机号</label><input value="${escapeHtml(user.phone || "-")}" readonly /></div>
      </div>
      <div class="grid">
        <div class="field">
          <label>姓名（可编辑）</label>
          <input id="detail-driver-name" value="${escapeHtml(user.driverName || "")}" required />
        </div>
        <div class="field">
          <label>昵称（可编辑）</label>
          <input id="detail-nickname" value="${escapeHtml(user.nickname || "")}" />
        </div>
      </div>
      <div class="grid">
        <div class="field">
          <label>${roleLicenseLabel}（可编辑）</label>
          <input id="detail-license-no" value="${escapeHtml(user.licenseNo || "")}" />
        </div>
        <div class="field"><label>状态</label><input value="${escapeHtml(statusText)}" readonly /></div>
      </div>
      <div class="field">
        <label>可用菜单（可编辑）</label>
        <div class="permission-options account-detail-perms">${permissionOptions}</div>
      </div>
      ${roleExtraFields}
      <div class="field account-detail-upload-field">
        <label>上传驾照图片（可编辑）</label>
        <div class="account-detail-upload-row">
          <input id="detail-license-image" class="account-detail-file-input-visible" type="file" accept="image/*" />
          <span id="account-detail-image-name" class="hint">未选择文件</span>
        </div>
        <div class="hint account-detail-upload-note">建议 JPG/PNG，大小不超过 5MB。</div>
      </div>
      <div class="field">
        <label>证件图片预览</label>
        <div id="account-detail-image-wrap" class="account-detail-image-wrap">${licenseImageSection}</div>
      </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" type="button" id="cancel-account-detail-btn">取消</button>
        <button class="btn btn-primary" type="submit">保存</button>
      </div>
    </form>
  `;

  const form = content.querySelector("#account-detail-form");
  if (form) {
    form.addEventListener("submit", saveAccountDetail);
  }
  const cancelBtn = content.querySelector("#cancel-account-detail-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeAccountDetailModal);
  }
  const imageInput = content.querySelector("#detail-license-image");
  if (imageInput) {
    imageInput.addEventListener("change", async () => {
      const file = imageInput.files?.[0];
      if (!file) return;
      const fileNameNode = content.querySelector("#account-detail-image-name");
      if (fileNameNode) fileNameNode.textContent = file.name || "已选择文件";
      if (!file.type.startsWith("image/")) {
        showToast("证件图片必须为图片格式");
        imageInput.value = "";
        if (fileNameNode) fileNameNode.textContent = "未选择文件";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("图片过大，请控制在 5MB 以内");
        imageInput.value = "";
        if (fileNameNode) fileNameNode.textContent = "未选择文件";
        return;
      }
      try {
        const previewData = await readFileAsDataURL(file);
        const wrap = content.querySelector("#account-detail-image-wrap");
        if (wrap) {
          wrap.innerHTML = `<img id="account-detail-image-preview" class="account-detail-image" src="${escapeHtml(previewData)}" alt="证件图片" />`;
        }
      } catch {
        showToast("证件图片读取失败，请重试");
      }
    });
  }

  const modal = document.getElementById("account-detail-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  STATE.accountDetailUserId = user.id;
}

function closeAccountDetailModal() {
  const modal = document.getElementById("account-detail-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  STATE.accountDetailUserId = null;
}

async function saveAccountDetail(event) {
  event.preventDefault();
  const userId = STATE.accountDetailUserId;
  const user = getUserById(userId);
  if (!user) {
    showToast("账号不存在，请刷新后重试");
    return;
  }

  const content = document.getElementById("account-detail-content");
  if (!content) return;

  const driverName = String(content.querySelector("#detail-driver-name")?.value || "").trim();
  const nicknameInput = String(content.querySelector("#detail-nickname")?.value || "").trim();
  const licenseNo = String(content.querySelector("#detail-license-no")?.value || "").trim();
  const permissions = Array.from(
    content.querySelectorAll('input[name="detail-permission"]:checked')
  ).map((input) => input.value);

  if (!driverName) {
    showToast("姓名不能为空");
    return;
  }
  if (!permissions.length) {
    showToast("请至少选择一个可用菜单");
    return;
  }

  const imageInput = content.querySelector("#detail-license-image");
  const imageFile = imageInput?.files?.[0];
  let licenseImage = user.licenseImage || "";
  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      showToast("证件图片必须为图片格式");
      return;
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      showToast("图片过大，请控制在 5MB 以内");
      return;
    }
    try {
      licenseImage = await readFileAsDataURL(imageFile);
    } catch {
      showToast("证件图片读取失败，请重试");
      return;
    }
  }

  user.driverName = driverName;
  user.nickname = nicknameInput || driverName;
  user.licenseNo = licenseNo;
  user.licenseImage = licenseImage;
  user.permissions = normalizePermissionKeys(permissions, getDefaultPermissionsByRole(user.role));

  if (STATE.currentUser && STATE.currentUser.id === user.id) {
    STATE.currentUser = user;
    ensureActiveViewAllowed();
  }

  persist();
  closeAccountDetailModal();
  render();
  showToast(`账号详情已保存：${user.account}`);
}

function renderMyProfilePanel() {
  const user = STATE.currentUser;
  if (!user) {
    return `<div class="empty">当前未登录。</div>`;
  }

  const role = normalizeRole(user.role);
  const headerHintMap = {
    supplier: "请完善供应商资料，便于后续协作与结算。",
    driver: "请及时维护司机及车辆信息，确保派单准确。",
    admin: "请维护管理员基础信息。",
  };

  let roleFields = `
    <div class="profile-grid">
      <div class="field">
        <label>姓名（必填）</label>
        <input id="profile-driver-name" value="" required />
      </div>
      <div class="field">
        <label>手机号（必填）</label>
        <input id="profile-phone" value="" required />
      </div>
    </div>
  `;

  if (role === "supplier") {
    roleFields = `
      <div class="profile-grid">
        <div class="field">
          <label>联系人（必填）</label>
          <input id="profile-driver-name" value="" required />
        </div>
        <div class="field">
          <label>联系人手机号（必填）</label>
          <input id="profile-phone" value="" required />
        </div>
      </div>
      <div class="field">
        <label>公司名称（必填）</label>
        <input id="profile-company-name" value="" required />
      </div>
      <div class="profile-grid">
        <div class="field">
          <label>公司联系人</label>
          <input id="profile-company-contact" value="" />
        </div>
        <div class="field">
          <label>公司电话</label>
          <input id="profile-company-phone" value="" />
        </div>
      </div>
      <div class="field">
        <label>公司地址</label>
        <input id="profile-company-address" value="" />
      </div>
      <div class="field">
        <label>业务范围</label>
        <textarea id="profile-business-scope"></textarea>
      </div>
    `;
  } else if (role === "driver") {
    roleFields = `
      <div class="profile-grid">
        <div class="field">
          <label>司机姓名（必填）</label>
          <input id="profile-driver-name" value="" required />
        </div>
        <div class="field">
          <label>手机号（必填）</label>
          <input id="profile-phone" value="" required />
        </div>
      </div>
      <div class="profile-grid">
        <div class="field">
          <label>住址</label>
          <input id="profile-home-address" value="" />
        </div>
        <div class="field">
          <label>驾照号码</label>
          <input id="profile-license-no" value="" />
        </div>
      </div>
      <div class="profile-grid">
        <div class="field">
          <label>车辆型号</label>
          <input id="profile-vehicle-model" value="" />
        </div>
        <div class="field">
          <label>车牌号</label>
          <input id="profile-vehicle-plate" value="" />
        </div>
      </div>
      <div class="profile-grid">
        <div class="field">
          <label>座位数</label>
          <input id="profile-vehicle-seats" value="" />
        </div>
        <div class="field">
          <label>车辆备注</label>
          <input id="profile-vehicle-desc" value="" />
        </div>
      </div>
    `;
  }

  return `
    <div class="toolbar">
      <h2>我的信息</h2>
      <div class="hint">${headerHintMap[role] || "请维护账号资料信息。"}</div>
    </div>
    <section class="profile-layout">
      <article class="card profile-card">
        <form id="my-profile-form">
          <div class="profile-grid">
            <div class="field">
              <label>登录账号</label>
              <input value="${escapeHtml(user.account || "")}" readonly />
            </div>
            <div class="field">
              <label>角色</label>
              <input value="${escapeHtml(getRoleLabel(role))}" readonly />
            </div>
          </div>
          <div class="field">
            <label>昵称</label>
            <input id="profile-nickname" value="" />
          </div>
          ${roleFields}
          <div class="form-actions"><button class="btn btn-primary" type="submit">保存信息</button></div>
        </form>
      </article>
    </section>
  `;
}

function bindMyProfileEvents(app) {
  const form = app.querySelector("#my-profile-form");
  if (!form || !STATE.currentUser) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = getUserById(STATE.currentUser.id);
    if (!user) {
      showToast("账号不存在，请重新登录");
      return;
    }

    const role = normalizeRole(user.role);
    const driverName = String(form.querySelector("#profile-driver-name")?.value || "").trim();
    const phone = sanitizePhone(form.querySelector("#profile-phone")?.value || "");
    const nicknameInput = String(form.querySelector("#profile-nickname")?.value || "").trim();

    if (!driverName) {
      showToast("姓名/联系人不能为空");
      return;
    }
    if (!phone) {
      showToast("手机号不能为空");
      return;
    }
    if (!isValidPhone(phone)) {
      showToast("手机号格式不正确");
      return;
    }
    if (STATE.users.some((item) => item.id !== user.id && item.phone && item.phone === phone)) {
      showToast("该手机号已被其他账号使用");
      return;
    }

    user.driverName = driverName;
    user.phone = phone;
    user.nickname = nicknameInput || driverName || user.account;

    if (role === "supplier") {
      const companyName = String(form.querySelector("#profile-company-name")?.value || "").trim();
      const companyContact = String(form.querySelector("#profile-company-contact")?.value || "").trim();
      const companyPhone = sanitizePhone(form.querySelector("#profile-company-phone")?.value || "");
      const companyAddress = String(form.querySelector("#profile-company-address")?.value || "").trim();
      const businessScope = String(form.querySelector("#profile-business-scope")?.value || "").trim();

      if (!companyName) {
        showToast("公司名称不能为空");
        return;
      }
      if (companyPhone && !isValidPhone(companyPhone)) {
        showToast("公司电话格式不正确");
        return;
      }

      user.companyName = companyName;
      user.companyContact = companyContact;
      user.companyPhone = companyPhone;
      user.companyAddress = companyAddress;
      user.businessScope = businessScope;
    }

    if (role === "driver") {
      user.homeAddress = String(form.querySelector("#profile-home-address")?.value || "").trim();
      user.licenseNo = String(form.querySelector("#profile-license-no")?.value || "").trim();
      user.vehicleModel = String(form.querySelector("#profile-vehicle-model")?.value || "").trim();
      user.vehiclePlate = String(form.querySelector("#profile-vehicle-plate")?.value || "").trim();
      user.vehicleSeats = String(form.querySelector("#profile-vehicle-seats")?.value || "").trim();
      user.vehicleDesc = String(form.querySelector("#profile-vehicle-desc")?.value || "").trim();
    }

    STATE.currentUser = user;
    persist();
    render();
    showToast("我的信息已保存");
  });
}

function bindUserPermissionEvents(app) {
  app.querySelectorAll("[data-view-user-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openAccountDetailModal(btn.dataset.viewUserDetail);
    });
  });

  app.querySelectorAll("[data-role-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      STATE.addUserRoleView = normalizeRole(btn.dataset.roleTab, "supplier");
      render();
    });
  });

  const createForm = app.querySelector("#create-user-form");
  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const role = normalizeRole(
        createForm.querySelector("#new-role")?.value || STATE.addUserRoleView,
        "supplier"
      );
      const account = createForm.querySelector("#new-account").value.trim();
      const password = createForm.querySelector("#new-password").value.trim();
      const driverName = createForm.querySelector("#new-driver-name").value.trim();
      const phone = sanitizePhone(createForm.querySelector("#new-phone").value);
      const licenseNo = String(createForm.querySelector("#new-license-no")?.value || "").trim();
      const companyNameInput = String(createForm.querySelector("#new-company-name")?.value || "").trim();
      const nicknameInput = String(createForm.querySelector("#new-nickname")?.value || "").trim();
      const nickname = nicknameInput || driverName;
      const imageFile = createForm.querySelector("#new-license-image").files[0];

      const permissions = Array.from(
        createForm.querySelectorAll('input[name="new-user-permission"]:checked')
      ).map((input) => input.value);
      const rolePermissionFixed = isRolePermissionFixed(role);

      if (!account || !password || !driverName || !phone) {
        showToast(`请完整填写：账号、密码、${getRoleLabel(role)}姓名/名称、手机号`);
        return;
      }
      if (!isValidPhone(phone)) {
        showToast("手机号格式不正确");
        return;
      }
      if (role === "supplier" && !companyNameInput) {
        showToast("公司名为必填项");
        return;
      }
      if (!permissions.length && !rolePermissionFixed) {
        showToast("请至少选择一个菜单权限");
        return;
      }
      if (STATE.users.some((u) => u.account === account)) {
        showToast("账号已存在，请更换");
        return;
      }
      if (STATE.users.some((u) => u.phone && u.phone === phone)) {
        showToast("手机号已存在，请更换");
        return;
      }

      let licenseImage = "";
      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          showToast("证件图片必须为图片格式");
          return;
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          showToast("图片过大，请控制在 5MB 以内");
          return;
        }
        try {
          licenseImage = await readFileAsDataURL(imageFile);
        } catch {
          showToast("证件图片读取失败，请重试");
          return;
        }
      }

      const user = {
        id: `U${Date.now()}`,
        account,
        password,
        nickname,
        driverName,
        phone,
        licenseNo,
        licenseImage,
        companyName: role === "supplier" ? companyNameInput : "",
        companyContact: role === "supplier" ? driverName : "",
        companyPhone: "",
        companyAddress: "",
        businessScope: "",
        homeAddress: "",
        vehicleModel: "",
        vehiclePlate: "",
        vehicleSeats: "",
        vehicleDesc: "",
        enabled: true,
        reviewStatus: "approved",
        role,
        permissions: normalizePermissionKeys(
          rolePermissionFixed ? [] : permissions,
          getDefaultPermissionsByRole(role)
        ),
      };

      STATE.users.unshift(user);
      STATE.activeView = "user-permissions";
      persist();
      render();
      showToast(`账号创建成功（${getRoleLabel(role)}）：${user.account}`);
    });
  }

  app.querySelectorAll("[data-save-permissions]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.savePermissions;
      const user = getUserById(userId);
      if (!user) {
        showToast("用户不存在，请刷新后重试");
        return;
      }
      if (isRolePermissionFixed(user.role)) {
        user.permissions = normalizePermissionKeys([], getDefaultPermissionsByRole(user.role));
        persist();
        render();
        showToast(`${getRoleLabel(user.role)}角色权限固定，已自动保持`);
        return;
      }

      const permissions = Array.from(app.querySelectorAll("input[data-user-permission]"))
        .filter((input) => input.dataset.userPermission === userId && input.checked)
        .map((input) => input.value);

      if (!permissions.length) {
        showToast("请至少保留一个菜单权限");
        return;
      }

      user.permissions = normalizePermissionKeys(permissions, getDefaultPermissionsByRole(user.role));

      if (STATE.currentUser && STATE.currentUser.id === user.id) {
        STATE.currentUser = user;
        ensureActiveViewAllowed();
      }

      persist();
      render();
      showToast(`权限已更新：${user.driverName || user.account}`);
    });
  });

  app.querySelectorAll("[data-reset-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.resetPassword;
      const user = getUserById(userId);
      if (!user) {
        showToast("用户不存在，请刷新后重试");
        return;
      }
      user.password = DEFAULT_RESET_PASSWORD;
      persist();
      showToast(`密码已重置为 ${DEFAULT_RESET_PASSWORD}（账号：${user.account}）`);
    });
  });

  app.querySelectorAll("[data-approve-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.approveUser;
      const user = getUserById(userId);
      if (!user) {
        showToast("用户不存在，请刷新后重试");
        return;
      }
      if (getUserAccountStatusKey(user) !== "pending") {
        showToast("该账号无需审核");
        return;
      }

      const confirmed = window.confirm(`确认审核通过账号 ${user.account}？通过后该账号即可启用登录。`);
      if (!confirmed) return;

      user.reviewStatus = "approved";
      user.enabled = true;

      persist();
      render();
      showToast(`已审核通过：${user.account}`);
    });
  });

  app.querySelectorAll("[data-toggle-user-enabled]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.toggleUserEnabled;
      const user = getUserById(userId);
      if (!user) {
        showToast("用户不存在，请刷新后重试");
        return;
      }
      if (STATE.currentUser && STATE.currentUser.id === user.id) {
        showToast("当前登录账号不允许禁用自己");
        return;
      }
      if (getUserAccountStatusKey(user) === "pending") {
        showToast("该账号待审核，请先点击“审核通过”");
        return;
      }
      if (user.enabled !== false) {
        const confirmedDisable = window.confirm(`确认禁用账号 ${user.account}？禁用后该账号将无法登录。`);
        if (!confirmedDisable) return;
      }

      user.enabled = user.enabled === false;

      if (STATE.currentUser && STATE.currentUser.id === user.id && user.enabled === false) {
        STATE.currentUser = null;
        STATE.activeView = "products";
        persist();
        render();
        showToast("当前账号已被禁用，已自动退出登录");
        return;
      }

      persist();
      render();
      showToast(`账号状态已更新：${user.account}`);
    });
  });

  app.querySelectorAll("[data-delete-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.deleteUser;
      const user = getUserById(userId);
      if (!user) {
        showToast("用户不存在，请刷新后重试");
        return;
      }
      if (STATE.currentUser && STATE.currentUser.id === user.id) {
        showToast("当前登录账号不允许删除自己");
        return;
      }

      const confirmed = window.confirm(`确认删除账号 ${user.account}？此操作不可恢复。`);
      if (!confirmed) return;

      STATE.users = STATE.users.filter((u) => u.id !== user.id);

      if (STATE.currentUser && STATE.currentUser.id === user.id) {
        STATE.currentUser = null;
        STATE.activeView = "products";
      }

      persist();
      render();
      showToast(`账号已删除：${user.account}`);
    });
  });
}

function bindOrderSearchEvents() {
  const viewLabelMap = {
    orders: "我的订单",
    "dispatch-center": "订单分配中心",
    "my-tasks": "我的任务",
    "account-query": "账号查询",
  };

  document.querySelectorAll("[data-order-search]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewKey = btn.dataset.orderSearch;
      const noInput = document.getElementById(`search-order-no-${viewKey}`);
      const dateInput = document.getElementById(`search-order-date-${viewKey}`);
      const roleInput = document.getElementById(`search-role-${viewKey}`);
      const statusInput = document.getElementById(`search-status-${viewKey}`);
      STATE.orderSearch[viewKey] = {
        orderNo: String(noInput?.value || "").trim(),
        date: String(dateInput?.value || "").trim(),
        role: String(roleInput?.value || "").trim(),
        status: String(statusInput?.value || "").trim(),
      };
      STATE.pagination[viewKey] = 1;
      render();
    });
  });

  document.querySelectorAll("[data-order-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewKey = btn.dataset.orderReset;
      STATE.orderSearch[viewKey] = { orderNo: "", date: "", role: "", status: "" };
      STATE.pagination[viewKey] = 1;
      render();
    });
  });

  document.querySelectorAll("[data-order-export]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewKey = btn.dataset.orderExport;
      const prefix = `${APP_NAME}_${viewLabelMap[viewKey] || "订单导出"}`;
      if (viewKey === "account-query") {
        exportAccountQueryToExcel(
          getFilteredUsersForAccountQuery(),
          getOrderSearchState("account-query"),
          prefix
        );
        return;
      }
      exportOrdersToExcel(getFilteredOrdersForView(viewKey), prefix);
    });
  });
}

function bindSettlementReportEvents() {
  const searchBtn = document.getElementById("settlement-search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const startDate = String(document.getElementById("settlement-start-date")?.value || "").trim();
      const endDate = String(document.getElementById("settlement-end-date")?.value || "").trim();
      if (startDate && endDate && startDate > endDate) {
        showToast("开始日期不能晚于结束日期");
        return;
      }
      STATE.settlementFilter = { startDate, endDate };
      STATE.pagination["settlement-report"] = 1;
      render();
    });
  }

  const resetBtn = document.getElementById("settlement-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      STATE.settlementFilter = { startDate: "", endDate: "" };
      STATE.pagination["settlement-report"] = 1;
      render();
    });
  }

  const exportBtn = document.getElementById("settlement-export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const role = normalizeRole(STATE.currentUser?.role);
      exportSettlementToExcel(
        getFilteredSettlementOrders(),
        role,
        `${APP_NAME}_结算统计`
      );
    });
  }
}

function bindPaginationEvents() {
  document.querySelectorAll("[data-page-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewKey = btn.dataset.pagePrev;
      const current = getPageState(viewKey);
      if (current <= 1) return;
      STATE.pagination[viewKey] = current - 1;
      render();
    });
  });

  document.querySelectorAll("[data-page-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewKey = btn.dataset.pageNext;
      const totalPages = Number(btn.dataset.totalPages) || 1;
      const current = getPageState(viewKey);
      if (current >= totalPages) return;
      STATE.pagination[viewKey] = current + 1;
      render();
    });
  });
}

function renderMainView() {
  const app = document.getElementById("app");
  ensureActiveViewAllowed();
  const stats = getDashboardStats();
  const statsCurrency = getCurrentUserOrders().find((order) => order.currency)?.currency || "RMB";
  const allowedMenus = getAllowedMenuItems();

  const menuButtons = allowedMenus.length
    ? allowedMenus
        .map(
          (item) =>
            `<button class="btn ${STATE.activeView === item.key ? "active" : "btn-soft"}" data-nav="${item.key}" type="button">${item.label}</button>`
        )
        .join("")
    : `<div class="empty compact-empty">当前账号未分配菜单权限。</div>`;

  let panelContent = `<div class="empty">当前账号未分配菜单权限，请联系管理员。</div>`;
  if (STATE.activeView === "products") {
    panelContent = renderProductsPanel();
  } else if (STATE.activeView === "orders") {
    panelContent = renderOrdersPanel();
  } else if (STATE.activeView === "dispatch-center") {
    panelContent = renderDispatchCenterPanel();
  } else if (STATE.activeView === "my-tasks") {
    panelContent = renderMyTasksPanel();
  } else if (STATE.activeView === "settlement-report") {
    panelContent = renderSettlementReportPanel();
  } else if (STATE.activeView === "my-profile") {
    panelContent = renderMyProfilePanel();
  } else if (STATE.activeView === "user-permissions") {
    panelContent = renderUserPermissionsPanel();
  } else if (STATE.activeView === "account-query") {
    panelContent = renderAccountQueryPanel();
  }

  const showStats = !["user-permissions", "account-query", "dispatch-center", "my-tasks", "settlement-report", "my-profile"].includes(STATE.activeView);

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <span class="brand-dot"></span>
          <span>${APP_BRAND}</span>
        </div>
        <div class="topbar-right">
          <span class="chip">当前账号：${escapeHtml(STATE.currentUser.account)}</span>
          <button class="btn btn-outline" id="logout-btn" type="button">退出登录</button>
        </div>
      </header>

      <main class="container">
        <section class="hero">
          <h1>${APP_PAGE_TITLE}</h1>
          <p>选择产品与出行日期后提交订单，信息将实时同步到管理端。</p>
        </section>

        <section class="layout">
          <aside class="card menu">
            <h3>功能菜单</h3>
            ${menuButtons}
            <div class="menu-note">仅显示当前账号已授权功能</div>
          </aside>

          <section class="card panel">
            ${showStats ? `
              <div class="stats">
                <div class="stat"><div class="num">${stats.orderCount}</div><div class="label">订单总数</div></div>
                <div class="stat"><div class="num">${stats.pendingCount}</div><div class="label">待处理</div></div>
                <div class="stat"><div class="num">${formatMoney(stats.totalAmount, statsCurrency)}</div><div class="label">有效金额</div></div>
              </div>
            ` : ""}

            ${panelContent}
          </section>
        </section>
      </main>
      <footer class="app-footer">${APP_COPYRIGHT}</footer>
    </div>
  `;

  app.querySelector("#logout-btn").addEventListener("click", () => {
    STATE.currentUser = null;
    STATE.activeView = "products";
    persist();
    render();
  });

  app.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      STATE.activeView = btn.dataset.nav;
      render();
    });
  });

  app.querySelectorAll("[data-book-product]").forEach((btn) => {
    btn.addEventListener("click", () => openOrderModal(btn.dataset.bookProduct));
  });

  app.querySelectorAll("[data-cancel-order]").forEach((btn) => {
    btn.addEventListener("click", () => cancelOrder(btn.dataset.cancelOrder));
  });
  app.querySelectorAll("[data-open-task]").forEach((node) => {
    node.addEventListener("click", () => openTaskDetailModal(node.dataset.openTask));
  });
  app.querySelectorAll("[data-dispatch-order]").forEach((btn) => {
    btn.addEventListener("click", () => assignOrderToDriver(btn.dataset.dispatchOrder));
  });

  bindOrderSearchEvents();
  bindPaginationEvents();

  if (STATE.activeView === "user-permissions" || STATE.activeView === "account-query") {
    bindUserPermissionEvents(app);
  }
  if (STATE.activeView === "my-profile") {
    bindMyProfileEvents(app);
  }
  if (STATE.activeView === "settlement-report") {
    bindSettlementReportEvents();
  }
}

function openOrderModal(productId) {
  if (!hasPermission(STATE.currentUser, "products")) {
    showToast("当前账号无下单权限");
    return;
  }

  const product = STATE.products.find((p) => p.id === productId);
  if (!product) return;
  const vehicleOptions = getProductVehicleOptions(product);
  if (!vehicleOptions.length) {
    showToast("当前产品未配置车型");
    return;
  }

  STATE.modalProductId = productId;
  const today = getTodayISO();
  const maxTravelDate = getFutureDateISOByMonths(3);
  const options = vehicleOptions
    .map((opt) => `<option value="${escapeHtml(opt.code)}" data-price="${Number(opt.price) || 0}">${escapeHtml(opt.label)} (${formatMoney(opt.price, product.currency)})</option>`)
    .join("");

  const form = document.getElementById("order-form");
  form.innerHTML = `
    <div class="field"><label>产品</label><input value="${escapeHtml(product.name)}" readonly /></div>
    <div class="grid">
      <div class="field"><label>出行日期</label><input id="travel-date" type="date" min="${today}" max="${maxTravelDate}" value="${today}" required /></div>
      <div class="field"><label>车型</label><select id="vehicle-type" required>${options}</select></div>
    </div>
    <div class="field"><label>价格</label><input id="price-display" value="${formatMoney(vehicleOptions[0].price, product.currency)} / 车" readonly /></div>
    <div class="grid">
      <div class="field"><label>人数</label><input id="travelers" type="number" min="1" step="1" value="1" required /></div>
      <div class="field"><label>价格说明</label><input value="页面价格为 10 小时包车参考价（RMB）" readonly /></div>
    </div>
    <div class="grid">
      <div class="field"><label>联系人</label><input id="contact-name" required placeholder="请输入联系人姓名" /></div>
      <div class="field"><label>联系电话</label><input id="contact-phone" required placeholder="请输入联系电话" /></div>
    </div>
    <div class="grid">
      <div class="field"><label>联系微信（选填）</label><input id="contact-wechat" placeholder="请输入微信号" /></div>
      <div class="field"><label>出发地址（选填）</label><input id="pickup-address" placeholder="请输入上车点地址" /></div>
    </div>
    <div class="field"><label>备注（选填）</label><textarea id="note" placeholder="例如：儿童座椅、行李件数等"></textarea></div>
    <div class="form-actions"><button class="btn btn-outline" type="button" id="cancel-order-modal">取消</button><button class="btn btn-primary" type="submit">提交订单</button></div>
  `;

  const modal = document.getElementById("order-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  const vehicleSelect = document.getElementById("vehicle-type");
  const priceDisplay = document.getElementById("price-display");
  const syncPrice = () => {
    const option = getVehicleOptionByCode(product, vehicleSelect.value);
    if (!option) return;
    priceDisplay.value = `${formatMoney(option.price, product.currency)} / 车`;
  };
  vehicleSelect.addEventListener("change", syncPrice);
  syncPrice();

  document.getElementById("cancel-order-modal").addEventListener("click", closeOrderModal);
  form.onsubmit = submitOrder;
}

function closeOrderModal() {
  const modal = document.getElementById("order-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  STATE.modalProductId = null;
}

function openTaskDetailModal(orderId) {
  if (!hasPermission(STATE.currentUser, "my-tasks")) {
    showToast("当前账号无任务权限");
    return;
  }

  const order = STATE.orders.find((item) => item.id === orderId);
  if (!order) {
    showToast("订单不存在");
    return;
  }
  if (order.assignedDriverId !== STATE.currentUser.id) {
    showToast("该订单未派发给当前账号");
    return;
  }

  const canCompleteByDate = isServiceDateOnOrBeforeToday(order.travelDate);
  const canConfirm = order.status === "dispatched";
  const canComplete = order.status === "confirmed" && canCompleteByDate;

  const content = document.getElementById("task-detail-content");
  if (!content) return;

  content.innerHTML = `
    <div class="field"><label>订单号</label><input value="${escapeHtml(order.orderNo || "-")}" readonly /></div>
    <div class="grid"><div class="field"><label>产品</label><input value="${escapeHtml(order.productName || "-")}" readonly /></div><div class="field"><label>车型</label><input value="${escapeHtml(order.vehicleLabel || "-")}" readonly /></div></div>
    <div class="grid"><div class="field"><label>出行日期</label><input value="${escapeHtml(formatDate(order.travelDate || ""))}" readonly /></div><div class="field"><label>状态</label><input value="${escapeHtml(getOrderStatusText(order.status))}" readonly /></div></div>
    <div class="grid"><div class="field"><label>联系人</label><input value="${escapeHtml(order.contactName || "-")}" readonly /></div><div class="field"><label>电话</label><input value="${escapeHtml(order.contactPhone || "-")}" readonly /></div></div>
    <div class="grid"><div class="field"><label>微信</label><input value="${escapeHtml(order.contactWechat || "-")}" readonly /></div><div class="field"><label>上车点</label><input value="${escapeHtml(order.pickupAddress || "-")}" readonly /></div></div>
    <div class="field"><label>派发金额</label><input value="${escapeHtml(formatSettlementMoney(getOrderDispatchAmount(order), order.currency))}" readonly /></div>
    <div class="field"><label>备注</label><textarea readonly>${escapeHtml(order.note || "-")}</textarea></div>
    <div class="hint" style="margin-bottom:8px">${canCompleteByDate ? "出行日期已到，可完成任务" : `未到出行日期，暂不可完成任务（${escapeHtml(formatDate(order.travelDate || ""))}）`}</div>
    <div class="form-actions">
      ${canConfirm ? `<button class="btn btn-soft" type="button" data-modal-confirm-task="${escapeHtml(order.id)}">确认接单</button>` : ""}
      <button class="btn btn-primary" type="button" data-complete-task="${escapeHtml(order.id)}" ${canComplete ? "" : "disabled"}>完成任务</button>
    </div>
  `;

  const modal = document.getElementById("task-detail-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  STATE.taskDetailOrderId = order.id;

  content.querySelectorAll("[data-modal-confirm-task]").forEach((btn) => {
    btn.addEventListener("click", () => confirmTaskOrder(btn.dataset.modalConfirmTask, true));
  });
  content.querySelectorAll("[data-complete-task]").forEach((btn) => {
    btn.addEventListener("click", () => completeTaskOrder(btn.dataset.completeTask));
  });
}

function closeTaskDetailModal() {
  const modal = document.getElementById("task-detail-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  STATE.taskDetailOrderId = null;
}

function submitOrder(event) {
  event.preventDefault();
  if (!STATE.currentUser || !STATE.modalProductId) return;
  if (!hasPermission(STATE.currentUser, "products")) {
    showToast("当前账号无下单权限");
    return;
  }

  const product = STATE.products.find((p) => p.id === STATE.modalProductId);
  if (!product) return;

  const travelDate = document.getElementById("travel-date").value;
  const vehicleCode = document.getElementById("vehicle-type").value;
  const travelers = Number(document.getElementById("travelers").value);
  const contactName = document.getElementById("contact-name").value.trim();
  const contactPhone = document.getElementById("contact-phone").value.trim();
  const contactWechat = document.getElementById("contact-wechat").value.trim();
  const pickupAddress = document.getElementById("pickup-address").value.trim();
  const note = document.getElementById("note").value.trim();
  const vehicle = getVehicleOptionByCode(product, vehicleCode);
  const today = getTodayISO();
  const maxTravelDate = getFutureDateISOByMonths(3);

  if (!travelDate || !vehicle || !travelers || travelers < 1 || !contactName || !contactPhone) {
    showToast("请完整填写下单信息");
    return;
  }
  if (travelDate < today || travelDate > maxTravelDate) {
    showToast(`出行日期仅支持 ${formatDate(today)} 至 ${formatDate(maxTravelDate)} 之间`);
    return;
  }
  const createdAt = nowDateTimeText();
  const order = {
    id: `O${Date.now()}`,
    orderNo: createOrderNo(),
    userId: STATE.currentUser.id,
    createdByRole: normalizeRole(STATE.currentUser.role, "supplier"),
    createdByName: STATE.currentUser.driverName || STATE.currentUser.nickname || STATE.currentUser.account,
    createdByAccount: STATE.currentUser.account,
    productId: product.id,
    productName: product.name,
    travelDate,
    vehicleCode: vehicle.code,
    vehicleLabel: vehicle.label,
    travelers,
    contactName,
    contactPhone,
    contactWechat,
    pickupAddress,
    note,
    totalAmount: Number(vehicle.price) || 0,
    dispatchAmount: 0,
    currency: product.currency,
    status: "pending",
    createdAt,
    assignedDriverId: "",
    assignedDriverName: "",
    assignedDriverAccount: "",
    dispatchedAt: "",
    confirmedAt: "",
  };

  STATE.orders.unshift(order);
  STATE.activeView = "orders";
  persist();
  closeOrderModal();
  render();
  showToast(`下单成功：${order.orderNo}`);
}

function cancelOrder(orderId) {
  if (!hasPermission(STATE.currentUser, "orders")) {
    showToast("当前账号无订单管理权限");
    return;
  }

  const order = STATE.orders.find((o) => o.id === orderId && o.userId === STATE.currentUser.id);
  if (!order || order.status !== "pending") return;

  order.status = "cancelled";
  persist();
  render();
  showToast(`已取消订单：${order.orderNo}`);
}

function assignOrderToDriver(orderId) {
  if (!hasPermission(STATE.currentUser, "dispatch-center")) {
    showToast("当前账号无订单分配权限");
    return;
  }

  const order = STATE.orders.find((item) => item.id === orderId);
  if (!order) {
    showToast("订单不存在，请刷新后重试");
    return;
  }
  if (getOrderOwnerRole(order) !== "supplier") {
    showToast("仅可分配供应商订单");
    return;
  }
  if (["cancelled", "confirmed", "completed"].includes(order.status)) {
    showToast("当前订单状态不可派发");
    return;
  }

  const select = document.getElementById(`dispatch-driver-${order.id}`);
  const driverId = select?.value || "";
  const dispatchPriceInput = document.getElementById(`dispatch-price-${order.id}`);
  const dispatchAmountRaw =
    dispatchPriceInput?.value === undefined || dispatchPriceInput?.value === ""
      ? getOrderDispatchAmount(order)
      : Number(dispatchPriceInput.value);
  if (!Number.isFinite(dispatchAmountRaw) || dispatchAmountRaw <= 0) {
    showToast("请输入有效的派发价格");
    return;
  }
  const dispatchAmount = Math.round(dispatchAmountRaw * 100) / 100;
  const driver = STATE.users.find(
    (user) => user.id === driverId && user.role === "driver" && user.enabled !== false
  );
  if (!driver) {
    showToast("请选择可用司机账号");
    return;
  }

  order.assignedDriverId = driver.id;
  order.assignedDriverName = driver.driverName || driver.nickname || driver.account;
  order.assignedDriverAccount = driver.account;
  order.dispatchAmount = dispatchAmount;
  order.dispatchedById = STATE.currentUser.id;
  order.dispatchedByName = STATE.currentUser.driverName || STATE.currentUser.nickname || STATE.currentUser.account;
  order.dispatchedAt = nowDateTimeText();
  order.status = "dispatched";

  persist();
  render();
  showToast(`订单已派发：${order.assignedDriverName}，结算价 ${formatSettlementMoney(dispatchAmount, order.currency)}`);
}

function confirmTaskOrder(orderId, reopenDetail = false) {
  if (!hasPermission(STATE.currentUser, "my-tasks")) {
    showToast("当前账号无任务确认权限");
    return;
  }

  const order = STATE.orders.find((item) => item.id === orderId);
  if (!order) {
    showToast("订单不存在，请刷新后重试");
    return;
  }
  if (order.assignedDriverId !== STATE.currentUser.id) {
    showToast("该订单未派发给当前账号");
    return;
  }
  if (order.status !== "dispatched") {
    showToast("当前订单无需确认");
    return;
  }

  order.status = "confirmed";
  order.confirmedAt = nowDateTimeText();
  order.confirmedById = STATE.currentUser.id;
  order.confirmedByName = STATE.currentUser.driverName || STATE.currentUser.nickname || STATE.currentUser.account;

  persist();
  if (reopenDetail) {
    render();
    setTimeout(() => openTaskDetailModal(order.id), 0);
  } else {
    closeTaskDetailModal();
    render();
  }
  showToast(`任务已确认：${order.orderNo}`);
}

function completeTaskOrder(orderId) {
  if (!hasPermission(STATE.currentUser, "my-tasks")) {
    showToast("当前账号无任务权限");
    return;
  }

  const order = STATE.orders.find((item) => item.id === orderId);
  if (!order) {
    showToast("订单不存在，请刷新后重试");
    return;
  }
  if (order.assignedDriverId !== STATE.currentUser.id) {
    showToast("该订单未派发给当前账号");
    return;
  }
  if (order.status !== "confirmed") {
    showToast("请先确认接单后再完成任务");
    return;
  }
  if (!isServiceDateOnOrBeforeToday(order.travelDate)) {
    showToast("未到服务日期，暂不可完成任务");
    return;
  }

  order.status = "completed";
  order.completedAt = nowDateTimeText();
  order.completedById = STATE.currentUser.id;
  order.completedByName = STATE.currentUser.driverName || STATE.currentUser.nickname || STATE.currentUser.account;

  persist();
  closeTaskDetailModal();
  render();
  showToast(`任务已完成：${order.orderNo}`);
}

function bindGlobalEvents() {
  const modal = document.getElementById("order-modal");
  modal.addEventListener("click", (event) => {
    if (event.target && event.target.dataset && event.target.dataset.closeModal === "true") {
      closeOrderModal();
    }
  });
  document.getElementById("close-modal-btn").addEventListener("click", closeOrderModal);

  const taskModal = document.getElementById("task-detail-modal");
  if (taskModal) {
    taskModal.addEventListener("click", (event) => {
      if (event.target && event.target.dataset && event.target.dataset.closeTaskModal === "true") {
        closeTaskDetailModal();
      }
    });
  }
  const taskCloseBtn = document.getElementById("close-task-modal-btn");
  if (taskCloseBtn) {
    taskCloseBtn.addEventListener("click", closeTaskDetailModal);
  }

  const accountModal = document.getElementById("account-detail-modal");
  if (accountModal) {
    accountModal.addEventListener("click", (event) => {
      if (event.target && event.target.dataset && event.target.dataset.closeAccountModal === "true") {
        closeAccountDetailModal();
      }
    });
  }
  const accountCloseBtn = document.getElementById("close-account-modal-btn");
  if (accountCloseBtn) {
    accountCloseBtn.addEventListener("click", closeAccountDetailModal);
  }
}

function render() {
  document.title = APP_NAME;
  if (!STATE.currentUser) {
    renderAuthView();
  } else {
    ensureActiveViewAllowed();
    renderMainView();
  }
}

function init() {
  load();
  bindGlobalEvents();
  render();
  hydrateFromCloud();
}

init();



