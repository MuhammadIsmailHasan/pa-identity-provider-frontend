import { useState, useMemo } from 'react';
import { Card, Row, Col, Input, Button, Spin } from 'antd';
import {
  SearchOutlined,
  ExportOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useOAuthClients } from '../hooks/useClients';
import { useDashboardStats } from '../hooks/useDashboard';
import type { OAuthClient } from '../types/oauth';


export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { data: clientsData, isLoading: clientsLoading } = useOAuthClients();
  const { data: statsData } = useDashboardStats(isAdmin);
  const [search, setSearch] = useState('');

  // Filter active apps & search term
  const activeApps = useMemo(() => {
    const list = (clientsData || []).filter((c) => c.is_active);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.app_name.toLowerCase().includes(q) ||
        c.client_id.toLowerCase().includes(q) ||
        (c.allowed_origins && c.allowed_origins.toLowerCase().includes(q))
    );
  }, [clientsData, search]);

  const handleLaunchApp = (client: OAuthClient) => {
    window.open(`${client.redirect_uri}`, '_blank');
  };

  // Color palette for cards to make them vibrant and distinct
  const cardThemes = [
    {
      gradient: 'from-emerald-600 to-teal-700',
      shadow: 'shadow-emerald-500/15',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-800',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800',
    },
    {
      gradient: 'from-blue-600 to-indigo-700',
      shadow: 'shadow-blue-500/15',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-800',
      buttonBg: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      gradient: 'from-purple-600 to-violet-700',
      shadow: 'shadow-purple-500/15',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      iconBg: 'bg-purple-100 text-purple-800',
      buttonBg: 'bg-purple-700 hover:bg-purple-800',
    },
    {
      gradient: 'from-amber-600 to-orange-700',
      shadow: 'shadow-amber-500/15',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-800',
      buttonBg: 'bg-amber-700 hover:bg-amber-800',
    },
    {
      gradient: 'from-rose-600 to-pink-700',
      shadow: 'shadow-rose-500/15',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-800',
      buttonBg: 'bg-rose-700 hover:bg-rose-800',
    },
    {
      gradient: 'from-cyan-600 to-sky-700',
      shadow: 'shadow-cyan-500/15',
      badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconBg: 'bg-cyan-100 text-cyan-800',
      buttonBg: 'bg-cyan-700 hover:bg-cyan-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* HERO WELCOME BANNER                                       */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold mb-4">
            <ThunderboltFilled />
            <span>Single Sign On Terintegrasi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Selamat Datang, {user?.name || 'Aparatur Peradilan'}!
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
            Pilih dan buka aplikasi operasional Pengadilan Agama Ngawi di bawah ini. Anda otomatis terotentikasi tanpa perlu memasukkan kata sandi berulang kali.
          </p>

          {/* Quick Search Input */}
          <div className="max-w-md">
            <Input
              prefix={<SearchOutlined className="text-slate-400 mr-2 text-base" />}
              placeholder="Cari aplikasi (cth. SIPP, Kepegawaian, E-Court)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="h-12 rounded-2xl text-sm shadow-md border-0"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADMIN STATS SUMMARY (Compact Bar for Admins)              */}
      {/* ========================================================= */}
      {isAdmin && statsData && (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-0 shadow-xs bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <TeamOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-slate-400">Total Pegawai</div>
                  <div className="text-xl font-extrabold text-slate-800">{statsData.totalEmployees}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-0 shadow-xs bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <AppstoreOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-slate-400">Aplikasi SSO</div>
                  <div className="text-xl font-extrabold text-slate-800">{statsData.totalClients}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-0 shadow-xs bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <ApartmentOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-slate-400">Struktur Jabatan</div>
                  <div className="text-xl font-extrabold text-slate-800">{statsData.totalJabatan}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="rounded-2xl border-0 shadow-xs bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <SafetyOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-slate-400">Role Mapping</div>
                  <div className="text-xl font-extrabold text-slate-800">{statsData.totalRoleMappings}</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* ========================================================= */}
      {/* SECTION TITLE                                             */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar Aplikasi Peradilan</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {activeApps.length} Aplikasi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik pada aplikasi untuk langsung masuk menggunakan akun SSO Pengadilan Agama Ngawi
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* APPLICATION CARDS (Large, Stunning Material 3 Cards)      */}
      {/* ========================================================= */}
      <Spin spinning={clientsLoading}>
        {activeApps.length === 0 && !clientsLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <AppstoreOutlined className="text-5xl text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada aplikasi yang sesuai</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search ? 'Coba gunakan kata kunci pencarian lain' : 'Belum ada aplikasi client yang terdaftar aktif di sistem'}
            </p>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {activeApps.map((app, index) => {
              const theme = cardThemes[index % cardThemes.length];
              return (
                <Col xs={24} sm={12} lg={8} key={app.id}>
                  <div
                    onClick={() => handleLaunchApp(app)}
                    className={`group cursor-pointer rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full min-h-[290px]`}
                  >
                    {/* Top Accent Gradient Bar */}
                    <div className={`h-2.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: Large Icon + Status */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          {/* App Emblem / Large Icon */}
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-tr ${theme.gradient} shadow-md group-hover:scale-105 transition-transform shrink-0`}
                          >
                            {app.app_name.charAt(0).toUpperCase()}
                          </div>

                          {/* Live Status Chip */}
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            SSO Aktif
                          </span>
                        </div>

                        {/* App Name & Client ID */}
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug mb-1">
                          {app.app_name}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {app.client_id}
                          </code>
                        </div>

                        {/* Description */}
                        {app.allowed_origins ? (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-4 line-clamp-1">
                            <GlobalOutlined className="text-slate-400" />
                            <span className="truncate">{app.allowed_origins}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                            Aplikasi operasional terintegrasi dalam SSO Pengadilan Agama Ngawi
                          </p>
                        )}
                      </div>

                      {/* Launch Button (Large, Full-Width) */}
                      <div className="pt-4 border-t border-slate-100 mt-2">
                        <Button
                          type="primary"
                          block
                          icon={<ExportOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchApp(app);
                          }}
                          className="h-11 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                        >
                          Buka Aplikasi
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </div>
  );
}
