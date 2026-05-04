import { useGetAdministrativeTree } from '@workspace/api-client-react';
import { DIVISION_DATA as DEFAULT_DIVISION_DATA } from '@/lib/administrative-data';

export function useDivisionData() {
  const { data: treeData, isLoading } = useGetAdministrativeTree();

  return { 
    divisionData: treeData ?? DEFAULT_DIVISION_DATA, 
    isLoading 
  };
}
