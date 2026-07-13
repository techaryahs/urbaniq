import { useState } from "react";
import { Eye, EyeOff, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white p-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <MapPinned size={40} />

            <h1 className="text-4xl font-bold">UrbanIQ</h1>
          </div>

          <p className="mt-4 text-blue-100 text-lg leading-8">
            Public Space Stewardship Intelligence Platform
          </p>
        </div>

        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Smarter GIS.
            <br />
            Better Cities.
          </h2>

          <p className="mt-6 text-lg text-blue-100">
            Analyze public spaces, manage GIS layers, upload GeoJSON, generate
            reports and empower city planning with intelligent spatial
            analytics.
          </p>
        </div>

        <div className="text-blue-100">© 2026 UrbanIQ GIS Platform</div>
      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h2>

            <p className="text-gray-500 mt-2">Login to continue</p>
          </div>

          <form className="mt-8 sm:mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 text-gray-700">Email</label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="********"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
