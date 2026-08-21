import { Route, Routes } from "react-router-dom";
import { AccessPage } from "./pages/access/AccessPage";
import { AuditPage } from "./pages/audit/AuditPage";
import { ExpenseSupportPage } from "./pages/expense-support/ExpenseSupportPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { FieldsPage } from "./pages/fields/FieldsPage";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { TenantsPage } from "./pages/tenants/TenantsPage";

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/tenants" element={<TenantsPage />} />
    <Route path="/access" element={<AccessPage />} />
    <Route path="/audit" element={<AuditPage />} />
    <Route path="/expenses" element={<ExpensesPage />} />
    <Route path="/expense-support" element={<ExpenseSupportPage />} />
    <Route path="/fields" element={<FieldsPage />} />
  </Routes>
);

export default App;
