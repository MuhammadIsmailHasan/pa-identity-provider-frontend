import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#00695c', // Material 3 Court Teal/Emerald
    colorPrimaryHover: '#004d40',
    colorPrimaryActive: '#00382e',
    colorSuccess: '#2e7d32',
    colorWarning: '#c27803',
    colorError: '#ba1a1a',
    colorInfo: '#00639b',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    borderRadius: 14,
    borderRadiusLG: 22,
    borderRadiusSM: 8,
    controlHeight: 46,
    colorBgBase: '#ffffff',
    colorTextBase: '#191c1e',
    colorBorder: '#c4c7c5',
  },
  components: {
    Layout: {
      siderBg: '#00382e', // Material Deep Pine
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
    Menu: {
      darkItemBg: '#00382e',
      darkSubMenuItemBg: '#002821',
      darkItemSelectedBg: '#00695c',
      darkItemSelectedColor: '#ffffff',
      itemBorderRadius: 10,
      itemMarginInline: 8,
    },
    Card: {
      borderRadiusLG: 22,
      boxShadowSecondary: '0 2px 8px -2px rgba(25, 28, 30, 0.08), 0 1px 4px -1px rgba(25, 28, 30, 0.04)',
      colorBorderSecondary: '#e0e2ec',
    },
    Button: {
      borderRadius: 24, // Material Pill Button
      controlHeight: 46,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 14,
      controlHeight: 48,
      colorBgContainer: '#f0f4f9',
      activeBorderColor: '#00695c',
      hoverBorderColor: '#00897b',
    },
    Table: {
      borderRadius: 16,
      headerBg: '#f1f4f9',
      headerColor: '#44474e',
      rowHoverBg: '#f8fafc',
    },
  },
};
