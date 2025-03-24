declare module 'src/services/UserContext' {
  export function useAuth(): { user: { uid: string } | null };
}

declare module 'src/components/DraggableCustomerCard' {
  import { FC } from 'react';

  interface Client {
    id: number;
    status: string;
    client_name: string;
    email_address: string;
    mobile_phone_number: string;
    originalStatus?: string;
    growth_backer?: string;
  }

  interface DraggableCustomerCardProps {
    client: Client;
    isSelected: boolean;
    onCheckboxChange: (clientId: number) => void;
  }

  const DraggableCustomerCard: FC<DraggableCustomerCardProps>;

  export default DraggableCustomerCard;
}

declare module 'src/components/DroppableColumn' {
  import { FC, ReactNode } from 'react';
  const DroppableColumn: FC<{ title: string; onDrop: (clientId: number, newStatus: string) => void; children?: ReactNode }>;
  export default DroppableColumn;
}

declare module 'src/components/FranchiseSelector' {
  import { FC } from 'react';
  const FranchiseSelector: FC<{ franchises: { label: string; value: string }[]; selectedFranchise: string; onSelect: (event: React.ChangeEvent<{ value: unknown }>) => void }>;
  export default FranchiseSelector;
}

declare module 'src/style' {
  import { FC, ReactNode } from 'react';
  export const LoadingIndicator: FC;
  export const FranchiseSelectContainer: FC<{ children?: ReactNode }>;
  export const ColumnsContainer: FC<{ children?: ReactNode }>;
}

declare module 'src/utils/apiUtils' {
  export function constructUrl(endpoint: string): string;
  export function constructWsUrl(endpoint: string): string;
}
