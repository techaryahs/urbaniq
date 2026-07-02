import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/upload" element={<Dashboard />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/reports" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
