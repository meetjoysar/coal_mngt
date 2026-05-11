import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Factory, LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Alert } from "../components/Alert";

export function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-smoke px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-5 shadow-panel">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-coal text-white">
            <Factory size={21} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-950">Gokul Fuel Chem</h1>
            <p className="text-sm text-slate-500">Coal PO Management</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="label">Username</span>
            <input className="field mt-1" value={username} onChange={(event) => setUsername(event.target.value)} required autoFocus />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <Alert>{error}</Alert>}
          <button className="btn-primary w-full" disabled={loading}>
            <LogIn size={17} />
            Login
          </button>
        </div>
      </form>
    </main>
  );
}
