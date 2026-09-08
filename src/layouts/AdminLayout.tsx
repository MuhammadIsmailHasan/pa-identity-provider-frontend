import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Drawer,
  Button,
} from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  SwapOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth, useLogoutMutation } from '../hooks/useAuth';
import { ROUTES } from '../config/routes';
import type { MenuProps } from 'antd';

const { Header, Content, Footer } = Layout;

export default function AdminLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const logoutMutation = useLogoutMutation();

  // Auto-close mobile drawer when window resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate(ROUTES.LOGIN);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 px-1">
          <div className="font-bold text-slate-800 text-sm">{user?.name}</div>
          <div className="text-xs text-slate-400">
            {user?.is_admin ? 'Super Administrator' : (user?.nip ? `NIP: ${user.nip}` : `@${user?.username}`)}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil Saya',
      onClick: () => navigate(ROUTES.PROFILE),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Top Nav Menu Items
  const navItems: MenuProps['items'] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <AppstoreOutlined className="text-base" />,
      label: <span className="font-semibold text-sm">Portal Aplikasi</span>,
    },
    ...(isAdmin
      ? [
          {
            key: 'admin-menu',
            icon: <DashboardOutlined className="text-base" />,
            label: <span className="font-semibold text-sm">Manajemen Sistem</span>,
            children: [
              {
                key: ROUTES.ADMIN_EMPLOYEES,
                icon: <TeamOutlined />,
                label: 'Pegawai & Pengguna',
              },
              {
                key: ROUTES.ADMIN_JABATAN,
                icon: <ApartmentOutlined />,
                label: 'Struktur Jabatan',
              },
              {
                key: ROUTES.ADMIN_CLIENTS,
                icon: <AppstoreOutlined />,
                label: 'Aplikasi Client (OAuth)',
              },
              {
                key: ROUTES.ADMIN_ROLE_MAPPINGS,
                icon: <SafetyOutlined />,
                label: 'Role Mapping Jabatan',
              },
              {
                key: ROUTES.ADMIN_ROLE_OVERRIDES,
                icon: <SwapOutlined />,
                label: 'Role Override Pegawai',
              },
            ],
          },
        ]
      : []),
  ];

  // Selected key calculation
  const getSelectedKey = () => {
    if (location.pathname === ROUTES.DASHBOARD || location.pathname === ROUTES.APPS) {
      return ROUTES.DASHBOARD;
    }
    const adminRoutes = [
      ROUTES.ADMIN_EMPLOYEES,
      ROUTES.ADMIN_JABATAN,
      ROUTES.ADMIN_CLIENTS,
      ROUTES.ADMIN_ROLE_MAPPINGS,
      ROUTES.ADMIN_ROLE_OVERRIDES,
    ];
    for (const r of adminRoutes) {
      if (location.pathname.startsWith(r)) return r;
    }
    return location.pathname;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout className="min-h-screen bg-slate-50 flex flex-col">
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR (Fixed vertical alignment & line-height)*/}
      {/* ========================================================= */}
      <Header
        style={{
          height: 72,
          lineHeight: 'normal',
          padding: '0 24px',
          backgroundColor: '#ffffff',
        }}
        className="border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between shadow-xs"
      >
        {/* Left: Brand Logo & Desktop Menu */}
        <div className="flex items-center gap-8 h-full">
          {/* Brand Logo */}
          <div
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-3 cursor-pointer group py-1 select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:bg-emerald-700 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-amber-300" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M4 7h16" />
                <path d="M4 7l-2 5h6l-2-5z" fill="#fcd34d" fillOpacity="0.25" />
                <path d="M20 7l-2 5h6l-2-5z" fill="#fcd34d" fillOpacity="0.25" />
                <circle cx="12" cy="7" r="1.5" fill="#fcd34d" />
                <path d="M8 21h8" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-tight">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  SSO PA Ngawi
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Kelas 1A
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                Pengadilan Agama Ngawi &bull; Mahkamah Agung RI
              </div>
            </div>
          </div>

          {/* Desktop Top Menu */}
          <div className="hidden md:flex items-center h-full">
            <Menu
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              items={navItems}
              onClick={({ key }) => {
                if (key !== 'admin-menu') navigate(key);
              }}
              style={{
                height: 72,
                lineHeight: '72px',
                borderBottom: 'none',
                backgroundColor: 'transparent',
                minWidth: 280,
              }}
              className="text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Right: User Profile Dropdown & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown Trigger */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100/80 rounded-2xl px-3 py-1.5 transition-colors border border-transparent hover:border-slate-200 select-none">
              <Avatar
                src={user?.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.avatar}` : undefined}
                className="bg-emerald-800 text-amber-300 shadow-sm shrink-0"
                size={38}
              >
                {user?.name ? getInitials(user.name) : <UserOutlined />}
              </Avatar>
              <div className="hidden lg:flex flex-col justify-center text-left">
                <span className="font-bold text-sm text-slate-800 leading-tight">
                  {user?.name || 'Pengguna'}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {user?.is_admin ? 'Super Administrator' : (user?.nip ? `NIP: ${user.nip}` : `@${user?.username}`)}
                </span>
              </div>
            </div>
          </Dropdown>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined className="text-lg" />}
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl"
          />
        </div>
      </Header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center text-xs">
              <SafetyCertificateOutlined />
            </div>
            <span className="font-bold text-slate-800 text-sm">Menu Navigasi SSO</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ body: { padding: '12px 8px' } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={navItems}
          onClick={({ key }) => {
            navigate(key);
            setMobileDrawerOpen(false);
          }}
          className="border-none"
        />
      </Drawer>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA (Full-Width Clean Container)             */}
      {/* ========================================================= */}
      <Content className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </Content>

      {/* Clean Footer */}
      <Footer className="bg-white border-t border-slate-200/80 text-center text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            &copy; {new Date().getFullYear()} <strong>Pengadilan Agama Ngawi Kelas 1A</strong> &bull; Mahkamah Agung Republik Indonesia
          </div>
          <div className="text-slate-400">
            Sistem Layanan Otentikasi Terpadu Single Sign On (SSO)
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
