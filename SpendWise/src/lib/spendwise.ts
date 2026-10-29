export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
};

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: string;
  type: TransactionType;
};

export type Budget = {
  id: string;
  categoryId: string;
  limit: number;
};

export type FinanceSettings = {
  currency: string;
  openingBalance: number;
  fractionDigits: 0 | 2;
  budgetAlertThreshold: number;
  displayName: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
};

export type FinanceData = {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: FinanceSettings;
};

export const STORAGE_KEY = "spendwise-data-v1";

export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food & Dining", type: "expense", color: "#f59e0b" },
  { id: "transport", name: "Transportation", type: "expense", color: "#38bdf8" },
  { id: "shopping", name: "Shopping", type: "expense", color: "#a78bfa" },
  { id: "bills", name: "Bills & Utilities", type: "expense", color: "#fb7185" },
  { id: "health", name: "Healthcare", type: "expense", color: "#34d399" },
  { id: "entertainment", name: "Entertainment", type: "expense", color: "#f472b6" },
  { id: "education", name: "Education", type: "expense", color: "#60a5fa" },
  { id: "other-expense", name: "Other", type: "expense", color: "#94a3b8" },
  { id: "salary", name: "Salary", type: "income", color: "#22c55e" },
  { id: "freelance", name: "Freelance", type: "income", color: "#14b8a6" },
  { id: "other-income", name: "Other income", type: "income", color: "#818cf8" },
];

export function createEmptyData(): FinanceData {
  return {
    transactions: [],
    budgets: [],
    categories: DEFAULT_CATEGORIES,
    settings: { currency: "INR", openingBalance: 0, fractionDigits: 2, budgetAlertThreshold: 80, displayName: "", email: "", phone: "", location: "", occupation: "" },
  };
}

export function withDemoProfileSettings(settings: FinanceSettings): FinanceSettings {
  return {
    ...settings,
    displayName: settings.displayName.trim() || "Alex Morgan",
    email: settings.email.trim() || "alex.morgan@example.com",
    phone: settings.phone.trim() || "+91 98765 43210",
    location: settings.location.trim() || "Bengaluru, India",
    occupation: settings.occupation.trim() || "Product designer",
  };
}

function dateInMonth(monthOffset: number, day: number) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function createDemoData(baseData: FinanceData = createEmptyData()): FinanceData {
  const demoCategories = [...DEFAULT_CATEGORIES, ...baseData.categories.filter(
    (category) => !DEFAULT_CATEGORIES.some((defaultCategory) => defaultCategory.id === category.id),
  )];
  return {
    ...baseData,
    settings: withDemoProfileSettings(baseData.settings),
    categories: demoCategories,
    transactions: [
      { id: "demo-salary-7", name: "Monthly salary", amount: 60000, categoryId: "salary", date: dateInMonth(-6, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-7", name: "Rent", amount: 17000, categoryId: "bills", date: dateInMonth(-6, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-7", name: "Groceries", amount: 3750, categoryId: "food", date: dateInMonth(-6, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-transport-7", name: "Monthly transit pass", amount: 1100, categoryId: "transport", date: dateInMonth(-6, 12), paymentMethod: "UPI", type: "expense" },
      { id: "demo-salary-6", name: "Monthly salary", amount: 62000, categoryId: "salary", date: dateInMonth(-5, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-6", name: "Rent", amount: 17500, categoryId: "bills", date: dateInMonth(-5, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-6", name: "Groceries", amount: 3900, categoryId: "food", date: dateInMonth(-5, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-transport-6", name: "Monthly transit pass", amount: 1200, categoryId: "transport", date: dateInMonth(-5, 12), paymentMethod: "UPI", type: "expense" },
      { id: "demo-salary-5", name: "Monthly salary", amount: 62000, categoryId: "salary", date: dateInMonth(-4, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-5", name: "Rent", amount: 17500, categoryId: "bills", date: dateInMonth(-4, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-5", name: "Groceries", amount: 4100, categoryId: "food", date: dateInMonth(-4, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-electricity-5", name: "Electricity bill", amount: 1850, categoryId: "bills", date: dateInMonth(-4, 12), paymentMethod: "UPI", type: "expense" },
      { id: "demo-salary-4", name: "Monthly salary", amount: 65000, categoryId: "salary", date: dateInMonth(-3, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-4", name: "Rent", amount: 18000, categoryId: "bills", date: dateInMonth(-3, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-4", name: "Groceries", amount: 4350, categoryId: "food", date: dateInMonth(-3, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-health-4", name: "Pharmacy", amount: 780, categoryId: "health", date: dateInMonth(-3, 15), paymentMethod: "UPI", type: "expense" },
      { id: "demo-salary-3", name: "Monthly salary", amount: 65000, categoryId: "salary", date: dateInMonth(-2, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-3", name: "Rent", amount: 18000, categoryId: "bills", date: dateInMonth(-2, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-3", name: "Groceries", amount: 4050, categoryId: "food", date: dateInMonth(-2, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-entertainment-3", name: "Movie tickets", amount: 1100, categoryId: "entertainment", date: dateInMonth(-2, 18), paymentMethod: "Credit card", type: "expense" },
      { id: "demo-salary-2", name: "Monthly salary", amount: 65000, categoryId: "salary", date: dateInMonth(-1, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-2", name: "Rent", amount: 18000, categoryId: "bills", date: dateInMonth(-1, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-2", name: "Groceries", amount: 4200, categoryId: "food", date: dateInMonth(-1, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-transport-2", name: "Metro and cab", amount: 1600, categoryId: "transport", date: dateInMonth(-1, 12), paymentMethod: "UPI", type: "expense" },
      { id: "demo-salary-1", name: "Monthly salary", amount: 65000, categoryId: "salary", date: dateInMonth(0, 1), paymentMethod: "Bank transfer", type: "income" },
      { id: "demo-rent-1", name: "Rent", amount: 18000, categoryId: "bills", date: dateInMonth(0, 3), paymentMethod: "Bank transfer", type: "expense" },
      { id: "demo-groceries-1", name: "Groceries", amount: 3850, categoryId: "food", date: dateInMonth(0, 8), paymentMethod: "Debit card", type: "expense" },
      { id: "demo-dinner", name: "Dinner with friends", amount: 1450, categoryId: "food", date: dateInMonth(0, 11), paymentMethod: "UPI", type: "expense" },
      { id: "demo-shopping", name: "Household essentials", amount: 2300, categoryId: "shopping", date: dateInMonth(0, 16), paymentMethod: "Credit card", type: "expense" },
      { id: "demo-freelance", name: "Design project", amount: 8500, categoryId: "freelance", date: dateInMonth(0, 20), paymentMethod: "Bank transfer", type: "income" },
    ],
    budgets: [
      { id: "demo-budget-food", categoryId: "food", limit: 5000 },
      { id: "demo-budget-transport", categoryId: "transport", limit: 4000 },
      { id: "demo-budget-shopping", categoryId: "shopping", limit: 5000 },
      { id: "demo-budget-bills", categoryId: "bills", limit: 20000 },
      { id: "demo-budget-health", categoryId: "health", limit: 3000 },
      { id: "demo-budget-entertainment", categoryId: "entertainment", limit: 3500 },
    ],
  };
}

export function formatCurrency(amount: number, currency: string, fractionDigits: 0 | 2 = 2) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function getCategory(data: FinanceData, id: string) {
  return data.categories.find((category) => category.id === id);
}

export function isSameMonth(date: string, reference = new Date()) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.getFullYear() === reference.getFullYear() && parsed.getMonth() === reference.getMonth();
}

export function getTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (totals, transaction) => {
      totals[transaction.type] += transaction.amount;
      return totals;
    },
    { income: 0, expense: 0 },
  );
}

export function getBudgetSpent(transactions: Transaction[], categoryId: string) {
  return transactions
    .filter((transaction) => transaction.type === "expense" && transaction.categoryId === categoryId && isSameMonth(transaction.date))
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function parseFinanceData(value: unknown): FinanceData | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.transactions) || !Array.isArray(data.budgets) || !Array.isArray(data.categories)) return null;
  if (typeof data.settings !== "object" || data.settings === null) return null;
  const settings = data.settings as Record<string, unknown>;
  if (typeof settings.currency !== "string" ||
    typeof settings.openingBalance !== "number" ||
    !Number.isFinite(settings.openingBalance) ||
    (settings.displayName !== undefined && typeof settings.displayName !== "string") ||
    (settings.email !== undefined && typeof settings.email !== "string") ||
    (settings.phone !== undefined && typeof settings.phone !== "string") ||
    (settings.location !== undefined && typeof settings.location !== "string") ||
    (settings.occupation !== undefined && typeof settings.occupation !== "string") ||
    (settings.budgetAlertThreshold !== undefined && (
      typeof settings.budgetAlertThreshold !== "number" ||
      !Number.isInteger(settings.budgetAlertThreshold) ||
      settings.budgetAlertThreshold < 1 ||
      settings.budgetAlertThreshold > 99
    )) ||
    (settings.fractionDigits !== undefined && settings.fractionDigits !== 0 && settings.fractionDigits !== 2)) return null;
  const valid =
    data.transactions.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const transaction = item as Record<string, unknown>;
      return typeof transaction.id === "string" && typeof transaction.name === "string" &&
        typeof transaction.amount === "number" && Number.isFinite(transaction.amount) && transaction.amount > 0 &&
        typeof transaction.categoryId === "string" && typeof transaction.date === "string" &&
        typeof transaction.paymentMethod === "string" &&
        (transaction.type === "income" || transaction.type === "expense");
    }) &&
    data.budgets.every((item) => typeof item === "object" && item !== null &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).categoryId === "string" &&
      typeof (item as Record<string, unknown>).limit === "number" &&
      Number.isFinite((item as Record<string, unknown>).limit) &&
      ((item as Record<string, unknown>).limit as number) > 0) &&
    data.categories.every((item) => typeof item === "object" && item !== null &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).name === "string" &&
      ((item as Record<string, unknown>).type === "income" || (item as Record<string, unknown>).type === "expense") &&
      typeof (item as Record<string, unknown>).color === "string");
  if (!valid) return null;
  return {
    transactions: data.transactions as Transaction[],
    budgets: data.budgets as Budget[],
    categories: data.categories as Category[],
    settings: {
      currency: settings.currency,
      openingBalance: settings.openingBalance,
      fractionDigits: settings.fractionDigits === 0 ? 0 : 2,
      budgetAlertThreshold: typeof settings.budgetAlertThreshold === "number" ? settings.budgetAlertThreshold : 80,
      displayName: typeof settings.displayName === "string" ? settings.displayName : "",
      email: typeof settings.email === "string" ? settings.email : "",
      phone: typeof settings.phone === "string" ? settings.phone : "",
      location: typeof settings.location === "string" ? settings.location : "",
      occupation: typeof settings.occupation === "string" ? settings.occupation : "",
    },
  };
}
