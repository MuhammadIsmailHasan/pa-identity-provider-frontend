import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import { oauthClientService } from '../services/oauthClientService';
import { jabatanService } from '../services/jabatanService';
import { roleMappingService } from '../services/roleMappingService';

export function useDashboardStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [employees, clients, jabatan, roleMappings] = await Promise.all([
        employeeService.list({ page: 1, page_size: 1 }),
        oauthClientService.list(),
        jabatanService.list(),
        roleMappingService.listMappings(),
      ]);
      return {
        totalEmployees: employees.total,
        totalClients: clients.length,
        totalJabatan: jabatan.length,
        totalRoleMappings: roleMappings.length,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
