import { Route, Routes } from "react-router-dom";
import { AccessPage } from "./pages/access/AccessPage";
import { AuditPage } from "./pages/audit/AuditPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ExpenseSupportPage } from "./pages/expense-support/ExpenseSupportPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { FieldsPage } from "./pages/fields/FieldsPage";
import { HomePage } from "./pages/home/HomePage";
import { IncomesPage } from "./pages/incomes/IncomesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { TenantsPage } from "./pages/tenants/TenantsPage";
import { UsersPage } from "./pages/users/UsersPage";

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/tenants" element={<TenantsPage />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/access" element={<AccessPage />} />
    <Route path="/audit" element={<AuditPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="/expenses" element={<ExpensesPage />} />
    <Route path="/incomes" element={<IncomesPage />} />
    <Route path="/expense-support" element={<ExpenseSupportPage />} />
    <Route path="/fields" element={<FieldsPage />} />
  </Routes>
);

export default App;
