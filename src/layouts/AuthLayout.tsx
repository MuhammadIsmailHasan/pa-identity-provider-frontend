import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-material-subtle text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white antialiased">
      <Outlet />
    </div>
  );
}
