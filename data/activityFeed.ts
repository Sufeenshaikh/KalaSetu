export interface ActivityEvent {
  id: string;
  type: 'like' | 'order';
  productTitle: string;
  timestamp: string;
  artisanId: string;
}

export const mockActivity: ActivityEvent[] = [
    { id: 'act-1', type: 'order', productTitle: 'Hand-Block Printed Scarf', timestamp: '2 hours ago', artisanId: 'artisan-1' },
    { id: 'act-2', type: 'like', productTitle: 'Terracotta Clay Pot', timestamp: '5 hours ago', artisanId: 'artisan-1' },
    { id: 'act-3', type: 'like', productTitle: 'Hand-Block Printed Scarf', timestamp: '1 day ago', artisanId: 'artisan-1' },
    { id: 'act-4', type: 'order', productTitle: 'Madhubani Painted Wall Art', timestamp: '2 days ago', artisanId: 'artisan-1' },
    { id: 'act-5', type: 'like', productTitle: 'Embroidered Cushion Cover', timestamp: '3 days ago', artisanId: 'artisan-1' },
];