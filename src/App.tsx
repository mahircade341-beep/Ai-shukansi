import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/components/RequireAuth";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import AppPage from "@/pages/AppPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
