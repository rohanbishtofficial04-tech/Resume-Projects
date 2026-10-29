# SpendWise

SpendWise is a personal finance dashboard for tracking income and expenses, managing budgets, and understanding spending over time. It is built with Next.js, React, TypeScript, Tailwind CSS, shadcn/ui components, and Recharts.

**Live site:** [spendwise-beta-steel.vercel.app](https://spendwise-beta-steel.vercel.app/)

## Updates

- **First-run demo experience:** New users start with sample transactions and budgets in Indian rupees (INR). The sample history covers the current month and the six preceding months, and sample food spending exceeds its budget to demonstrate the notification bell.
- **Refreshable sample data:** Use **Settings → Load demo data** to replace transactions and budgets with the sample dataset. Existing categories, preferences, and profile details are preserved. Confirm before loading.
- **Dashboard and analytics:** The dashboard includes a seven-month cash-flow chart, category charts, recent transactions, balances, and budget progress. Analytics opens to the current month and six preceding months, with editable date filters.
- **Profile and greeting:** Add a display name and optional contact details on the separate Profile page. A saved name appears in the homepage greeting and account menu. Profile edits require **Save changes**.
- **Budget notifications:** The header bell displays the number of current-month budget alerts. Each alert identifies the category, amount spent, limit, and percentage. Alerts begin at a configurable threshold (default 80%) and distinguish approaching, reached (100%), and exceeded (over 100%) budgets. Notifications are in-app only.
- **About page:** A project colophon describes SpendWise, its privacy approach, and its technology stack.
- **Settings and data controls:** Preferences live in Settings, separate from personal profile details. The confirmed **Clear data** action removes financial records and resets financial settings.
- **Theme-friendly charts:** Chart tooltips remain readable in dark mode, and chart hover highlights no longer cover the data.
- **Updated branding:** The sidebar logo and browser favicon use the SpendWise wallet icon. The browser tab title is “SpendWise”.
- **Local-first storage:** Finance data is saved in this browser only; there is no account or backend.

## Features

- **Overview:** Opening balance, all-time balance, monthly income, expenses and savings, seven-month cash-flow chart, spending breakdown, recent transactions, and budgets.
- **Transactions:** Add, edit, delete, search, sort, and filter income and expense records. Transactions include a name, amount, category, date, and payment method.
- **Budgets:** Set monthly spending limits by expense category. Progress is calculated from expense transactions in that category during the current month.
- **Analytics:** Review income, expenses, net savings, and category spending for a selectable date range. The default range includes the current month and six preceding months.
- **Categories:** Organize income and expenses with separate categories and colors.
- **Profile:** Optionally save a display name, email, phone number, location, and occupation.
- **Settings:** Choose a preferred currency, starting balance, budget alert threshold, theme, and amount precision. Supported currencies are USD, INR, EUR, GBP, CAD, AUD, and JPY.
- **Data controls:** Load sample data or clear financial data with confirmation.
- **Budget notifications:** The top-right bell shows a count badge for current-month budgets at or above the alert threshold. Open it for category-specific spending and limit details. Change the threshold in **Settings → Budget alert threshold**; the default is 80%. Alerts stay in the app and do not use browser push notifications.
- **About:** Learn about SpendWise, its privacy approach, and its technology stack.
- **Responsive interface:** Navigate the app on desktop and smaller screens, with light, dark, and system theme options.

## Getting started

### Requirements

- Node.js compatible with the installed Next.js version.
- Corepack with pnpm, or a compatible pnpm installation.

### Install and run the development server

From the project directory:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, Next.js will select another available port and print its URL in the terminal.

### Production build

```bash
corepack pnpm build
corepack pnpm start
```

### Lint

```bash
corepack pnpm lint
```

## Using SpendWise

1. **Explore the overview.** First-time users see sample data. Review the balances, charts, recent activity, and budget progress.
2. **Add your own transactions.** Open **Transactions**, choose **Add transaction**, then enter its type, name, amount, category, date, and payment method.
3. **Create budgets.** Open **Budgets** and set a monthly limit for an expense category. Record expenses in **Transactions** to update its progress.
4. **Review trends.** Open **Analytics** and adjust the date range to inspect income, spending, and savings.
5. **Personalize the app.** Set your display name and optional details in **Profile**; configure currency, balance, budget alert threshold, appearance, and decimal places in **Settings**.
6. **Reset or reload sample records.** In **Settings**, choose **Clear data** to remove transactions and budgets, or **Load demo data** to replace those records with sample entries. Both actions ask for confirmation.

Loading demo data replaces transactions and budgets, while retaining categories, profile details, and preferences. Clearing data resets the finance data to its defaults: transactions and budgets are removed, default categories are restored, and settings (including profile details) are reset.

## How balances and budgets are calculated

- **Total balance** = starting balance + all-time income − all-time expenses.
- **Monthly savings** = income − expenses recorded in the current calendar month.
- **Budget spending** = expenses assigned to that budget’s category in the current calendar month. Changing or deleting those transactions updates budget progress.
- **Analytics totals** are calculated from transactions whose dates fall within the selected range.

## Data and privacy

SpendWise stores its finance data in browser `localStorage` under the `spendwise-data-v1` key. The data is specific to the current browser profile and device; it is not synchronized to a server. Clearing browser site data can remove it. Loading sample data replaces the stored transactions and budgets, so preserve any records you want to keep before doing so.

## Project structure

```text
src/
  app/                      Next.js routes and global styles
  components/
    spendwise/               Finance pages and shared finance UI
    ui/                      Reusable interface components
  lib/
    spendwise.ts             Finance types, defaults, calculations, and demo data
public/
  logo.svg                   Sidebar brand icon
```
