import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import idID from 'antd/locale/id_ID';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { theme } from './config/theme';
import { queryClient } from './config/queryClient';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme} locale={idID}>
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
