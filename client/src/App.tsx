import { Route, Routes } from "react-router-dom";
import { AccessPage } from "./pages/access/AccessPage";
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
  </Routes>
);

export default App;
