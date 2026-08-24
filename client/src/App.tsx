import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { GuestOnly } from "./components/layout/GuestOnly";
import { AccessPage } from "./pages/access/AccessPage";
import { AuditPage } from "./pages/audit/AuditPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ExpenseSupportPage } from "./pages/expense-support/ExpenseSupportPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { FieldsPage } from "./pages/fields/FieldsPage";
import { HomePage } from "./pages/home/HomePage";
import { IncomesPage } from "./pages/incomes/IncomesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { NotFoundPage } from "./pages/not-found/NotFoundPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { CreateTenantPage } from "./pages/tenants/CreateTenantPage";
import { EditTenantPage } from "./pages/tenants/EditTenantPage";
import { TenantsPage } from "./pages/tenants/TenantsPage";
import { UsersPage } from "./pages/users/UsersPage";

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <GuestOnly>
          <LoginPage />
        </GuestOnly>
      }
    />
    <Route
      path="/register"
      element={
        <GuestOnly>
          <RegisterPage />
        </GuestOnly>
      }
    />
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/tenants" element={<TenantsPage />} />
      <Route path="/tenants/new" element={<CreateTenantPage />} />
      <Route path="/tenants/:tenantId/edit" element={<EditTenantPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/access" element={<AccessPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/incomes" element={<IncomesPage />} />
      <Route path="/expense-support" element={<ExpenseSupportPage />} />
      <Route path="/fields" element={<FieldsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
