import { AuthProvider, useAuth } from "./auth/Authcontext";
import { LanguageProvider } from "./context/LanguageContext";
import LoginPage          from "./pages/loginpage";
import AshaDashboard      from "./views/ashadashboard";
import SupervisorDashboard from "./views/supervisordashboard";

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
      <LanguageProvider>
        <AppRouter />
      </LanguageProvider>
    </AuthProvider>
  );
}