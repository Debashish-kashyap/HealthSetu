import { AuthProvider, useAuth } from "./auth/authcontext";
import LoginPage          from "./pages/LoginPage";
import AshaDashboard      from "./views/AshaDashboard";
import SupervisorDashboard from "./views/SupervisorDashboard";

function AppRouter() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  
  if (user.role === "asha")       return <AshaDashboard />;
  if (user.role === "supervisor") return <SupervisorDashboard />;

  // Unknown role — force logout
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"sans-serif" }}>
      <div>Unknown role: {user.role}. <button onClick={() => useAuth().logout()}>Logout</button></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}