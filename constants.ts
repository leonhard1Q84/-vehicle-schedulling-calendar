
import { CarGroup, EventType, FleetEvent, Vehicle } from "./types";

// Configuration
export const CELL_WIDTH = 140; 
export const CELL_WIDTH_HOUR = 60;
export const HEADER_HEIGHT = 66; 
export const ROW_HEIGHT_STD = 50; 
export const EVENT_HEIGHT = 38;   
export const EVENT_GAP = 6;       

// Helper to get color based on Type AND Status AND Vehicle Context
export const getEventColor = (event: FleetEvent, vehicle?: Vehicle): string => {
  const status = event.status?.toLowerCase() || '';

  // 1. History / Returned (已还车) - Light Sky Blue (Contrast against Slate weekend)
  if (status.includes('returned') || status.includes('completed') || status.includes('done') || status.includes('past')) {
    return 'bg-sky-100 text-sky-700 border border-sky-300 shadow-sm'; 
  }

  switch (event.type) {
    case EventType.BOOKING_UNASSIGNED:
      // Pending (待分配) - Light Amber/Yellow
      return 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm font-medium'; 
    
    case EventType.BOOKING_ASSIGNED:
      // 2. Picked Up (已取车) - Indigo
      if (status.includes('picked up') || status.includes('active')) {
          return 'bg-indigo-600 text-white shadow-md border border-indigo-700 z-20'; 
      }
      
      // 3. Assigned (已分配/预订) - Blue
      return 'bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors border border-blue-600'; 

    case EventType.MAINTENANCE:
      // Maint (维修保养) - Slate Gray
      return 'bg-slate-600 text-white shadow-sm border border-slate-700'; 

    case EventType.STOP_SALE:
      // Temp Hold (临时控量) - Orange (Changed from Red)
      return 'bg-orange-500 text-white shadow-sm border border-orange-600'; 

    case EventType.BLOCK:
      // Distinguish Internal Use vs Ops Lock based on reason
      const reason = event.reason?.toLowerCase() || '';
      // Ops Lock (运营锁定) - Purple
      if (reason.includes('operation') || reason.includes('ops') || reason.includes('lock')) {
          return 'bg-purple-600 text-white shadow-sm border border-purple-700'; 
      }
      // Internal Use (内部使用) - Cyan
      return 'bg-cyan-600 text-white shadow-sm border border-cyan-700'; 

    default:
      return 'bg-gray-500 text-white';
  }
};

export const EVENT_LABELS: Record<EventType, string> = {
  [EventType.BOOKING_ASSIGNED]: 'Reservation',
  [EventType.BOOKING_UNASSIGNED]: 'Pending',
  [EventType.MAINTENANCE]: 'Maintenance',
  [EventType.STOP_SALE]: 'Temp Hold', // Renamed from Stop Sale
  [EventType.BLOCK]: 'Block',
};

// Helper: Check date overlap
export const checkOverlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  // Ensure strict overlap check
  return s1 < e2 && s2 < e1;
};

// Mock Data
export const MOCK_GROUPS: CarGroup[] = [
  { id: 'g1', name: 'ECONOMY (GROUP A)' },
  { id: 'g2', name: 'COMPACT (GROUP B)' },
  { id: 'g3', name: 'SUV (GROUP C)' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  // --- Group 1: Economy ---
  { id: 'v1', plate: '成田300わ2234', model: 'Toyota Yaris', sipp: 'ECMR', color: 'White', groupId: 'g1', status: 'available', storeId: 'Narita', features: ['snow_tires', 'telematics'] },
  { id: 'v2', plate: '成田300わ2382', model: 'Honda Fit', sipp: 'ECMR', color: 'Silver', groupId: 'g1', status: 'available', storeId: 'Narita', features: ['telematics'] },
  { id: 'v3', plate: '成田300わ2404', model: 'Nissan Note', sipp: 'ECAR', color: 'Blue', groupId: 'g1', status: 'maintenance', storeId: 'Narita' },
  { id: 'v4', plate: '成田300わ2435', model: 'Toyota Yaris', sipp: 'ECMR', color: 'White', groupId: 'g1', status: 'available', storeId: 'Narita', features: ['snow_tires'] }, 
  { id: 'v5', plate: '成田300わ2427', model: 'Toyota Yaris', sipp: 'ECMR', color: 'Black', groupId: 'g1', status: 'backup', storeId: 'Narita' },
  
  // Virtual Buffer for Group 1
  { id: 'v_buffer_g1', plate: 'Swap Buffer', model: 'Pool', sipp: '----', color: '', groupId: 'g1', status: 'available', storeId: 'Narita', isVirtual: true },

  // --- Group 2: Compact ---
  { id: 'v6', plate: '成田300わ2438', model: 'Toyota Corolla', sipp: 'CDAR', color: 'Black', groupId: 'g2', status: 'available', storeId: 'Narita', features: ['telematics'] },
  { id: 'v7', plate: '成田300わ2439', model: 'Mazda 3', sipp: 'CDMR', color: 'Red', groupId: 'g2', status: 'available', storeId: 'Narita' },
  { id: 'v8', plate: '成田300わ2443', model: 'Mazda 3', sipp: 'CDMR', color: 'Silver', groupId: 'g2', status: 'available', storeId: 'Narita' },
  { id: 'v9', plate: '成田300わ2444', model: 'Honda Civic', sipp: 'CDAR', color: 'White', groupId: 'g2', status: 'backup', storeId: 'Narita' },
  
  // Virtual Buffer for Group 2
  { id: 'v_buffer_g2', plate: 'Swap Buffer', model: 'Pool', sipp: '----', color: '', groupId: 'g2', status: 'available', storeId: 'Narita', isVirtual: true },

  // --- Group 3: SUV ---
  { id: 'v10', plate: '成田300わ2463', model: 'Toyota RAV4', sipp: 'IFAR', color: 'Grey', groupId: 'g3', status: 'available', storeId: 'Narita', features: ['snow_tires', 'telematics'] },
  { id: 'v11', plate: '成田300わ2507', model: 'Toyota RAV4', sipp: 'IFAR', color: 'Black', groupId: 'g3', status: 'available', storeId: 'Narita' },

  // Virtual Buffer for Group 3
  { id: 'v_buffer_g3', plate: 'Swap Buffer', model: 'Pool', sipp: '----', color: '', groupId: 'g3', status: 'available', storeId: 'Narita', isVirtual: true },
];

const today = new Date();
const addDate = (days: number, hours: number = 10, minutes: number = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const MOCK_EVENTS: FleetEvent[] = [
  // --- PENDING / UNASSIGNED QUEUE ---
  {
    id: 'JRT624503',
    type: EventType.BOOKING_UNASSIGNED,
    groupId: 'g1',
    vehicleId: null,
    startDate: addDate(1, 10, 0),
    endDate: addDate(4, 10, 0),
    customerName: 'Pending A',
    reservationId: 'JRT624503',
    status: 'Pending',
    modelPreference: 'Toyota Yaris',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
  {
    id: 'YTT416327',
    type: EventType.BOOKING_UNASSIGNED,
    groupId: 'g2',
    vehicleId: null,
    startDate: addDate(2, 14, 0),
    endDate: addDate(5, 12, 0),
    customerName: 'Pending B',
    reservationId: 'YTT416327',
    status: 'Pending',
    modelPreference: 'Mazda 3',
    pickupLocation: 'Haneda',
    dropoffLocation: 'Haneda',
  },

  // --- VEHICLE 1: Yaris (v1) ---
  {
    id: 'TNA568495',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g1',
    vehicleId: 'v1',
    startDate: addDate(-4, 9, 0),
    endDate: addDate(-1, 18, 0),
    customerName: 'History Log',
    reservationId: 'TNA568495',
    status: 'Returned', 
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
  {
    id: 'HTG995846',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g1',
    vehicleId: 'v1',
    startDate: addDate(0, 10, 0),
    endDate: addDate(2, 10, 0),
    customerName: 'Active User',
    reservationId: 'HTG995846',
    status: 'Picked Up', // Active
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
  {
    id: 'UEU655091',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g1',
    vehicleId: 'v1',
    startDate: addDate(3, 14, 0),
    endDate: addDate(6, 14, 0),
    customerName: 'Future User',
    reservationId: 'UEU655091',
    status: 'Confirmed',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
    isLocked: true, // Locked
  },

  // --- VEHICLE 2: Honda Fit (v2) ---
  {
    id: 'EZG073972',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g1',
    vehicleId: 'v2',
    startDate: addDate(1, 9, 0),
    endDate: addDate(5, 18, 0),
    customerName: 'VIP Customer',
    reservationId: 'EZG073972',
    status: 'Confirmed',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
    notes: 'Needs child seat.', // Has Notes
    isLocked: true, 
  },

  // --- VEHICLE 3: Nissan Note (v3) [Maintenance] ---
  {
    id: 'MAINT-V3', 
    type: EventType.MAINTENANCE,
    groupId: 'g1',
    vehicleId: 'v3', 
    startDate: addDate(-2, 8, 0),
    endDate: addDate(4, 18, 0),
    maintenanceType: 'Major Repair',
    status: 'In Progress',
    notes: 'Engine check required.',
  },

  // --- VEHICLE 4: Yaris (v4) ---
  {
    id: 'ZAE764553',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g1',
    vehicleId: 'v4',
    startDate: addDate(1, 10, 0),
    endDate: addDate(3, 15, 0),
    customerName: 'One Way User',
    reservationId: 'ZAE764553',
    status: 'Confirmed', 
    pickupLocation: 'Haneda', // Cross Store
    dropoffLocation: 'Narita T1', // Different return
    notes: 'Cross store return.',
  },

  // --- VEHICLE 5: Yaris (v5) [Backup] ---
  {
    id: 'HLD-V5',
    type: EventType.STOP_SALE,
    groupId: 'g1',
    vehicleId: 'v5',
    startDate: addDate(0, 9, 0),
    endDate: addDate(3, 18, 0),
    status: 'Hold',
    reason: 'Safety Recall',
  },

  // --- VEHICLE 6: Corolla (v6) ---
  {
    id: 'VGA821249',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g2',
    vehicleId: 'v6',
    startDate: addDate(0, 10, 0),
    endDate: addDate(0, 16, 0), // Same day 6 hours
    customerName: 'Short Trip',
    reservationId: 'VGA821249',
    status: 'Confirmed',
    pickupLocation: 'Narita T2',
    dropoffLocation: 'Narita T2',
  },
  {
    id: 'GGS490065',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g2',
    vehicleId: 'v6',
    startDate: addDate(1, 9, 0),
    endDate: addDate(4, 9, 0), 
    customerName: 'Next Customer',
    reservationId: 'GGS490065',
    status: 'Confirmed',
    pickupLocation: 'Narita T2',
    dropoffLocation: 'Narita T2',
  },

  // --- VEHICLE 7: Mazda 3 (v7) ---
  {
    id: 'XFT359978',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g2',
    vehicleId: 'v7',
    startDate: addDate(-2, 10, 0),
    endDate: addDate(1, 10, 0), 
    customerName: 'Returning Today',
    reservationId: 'XFT359978',
    status: 'Picked Up', 
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
  {
    id: 'BLK-V7',
    type: EventType.BLOCK, 
    groupId: 'g2',
    vehicleId: 'v7', 
    startDate: addDate(2, 9, 0),
    endDate: addDate(4, 18, 0),
    reason: 'Internal Use', // Internal Block
    status: 'Active',
    notes: 'Sales demo',
  },

  // --- VEHICLE 8: Mazda 3 (v8) ---
  {
    id: 'OPS-V8',
    type: EventType.BLOCK, 
    groupId: 'g2',
    vehicleId: 'v8', 
    startDate: addDate(0, 9, 0),
    endDate: addDate(3, 12, 0),
    reason: 'Ops Lock', // Operational Lock
    status: 'Active',
  },

  // --- VEHICLE 10: RAV4 (v10) ---
  {
    id: 'HYJ360059',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g3',
    vehicleId: 'v10', 
    startDate: addDate(-1, 10, 0),
    endDate: addDate(6, 10, 0), // Long rental
    customerName: 'Long Term',
    reservationId: 'HYJ360059',
    status: 'Picked Up',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
    notes: 'Airport pickup confirmed',
    isLocked: true,
  },
  
  // --- VEHICLE 11: RAV4 (v11) ---
   {
    id: 'KCG708735',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g3',
    vehicleId: 'v11',
    startDate: addDate(0, 8, 0),
    endDate: addDate(2, 20, 0),
    customerName: 'Double A',
    reservationId: 'KCG708735',
    status: 'Confirmed',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
  {
    id: 'UHU982477',
    type: EventType.BOOKING_ASSIGNED,
    groupId: 'g3',
    vehicleId: 'v11',
    startDate: addDate(3, 9, 0),
    endDate: addDate(5, 9, 0),
    customerName: 'Double B',
    reservationId: 'UHU982477',
    status: 'Confirmed',
    pickupLocation: 'Narita T1',
    dropoffLocation: 'Narita T1',
  },
];
