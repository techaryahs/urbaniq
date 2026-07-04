import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}

        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/map"
                    element={
                      <ProtectedRoute
                        allowedRoles={["researcher", "city_planner"]}
                      >
                        <MapPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute allowedRoles={["researcher"]}>
                        <UploadPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute allowedRoles={["city_planner"]}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={["city_planner"]}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
