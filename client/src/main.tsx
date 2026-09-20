import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { BrowserRouter } from "react-router-dom";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { AuthProvider } from "./hooks/useAuth";
import { SidebarProvider } from "./hooks/useSidebar";
import { ThemeProvider } from "./hooks/useTheme";
import { AppToaster } from "./components/feedback/AppToaster";
import {
  applySidebarCollapsed,
  readStoredSidebarCollapsed,
} from "./lib/sidebar";
import { applyThemePreference, readStoredThemePreference } from "./lib/theme";
import App from "./App.tsx";
import "./index.css";

applyThemePreference(readStoredThemePreference() ?? "LIGHT");
applySidebarCollapsed(readStoredSidebarCollapsed() ?? false);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <App />
              <AppToaster />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
