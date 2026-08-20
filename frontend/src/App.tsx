import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
