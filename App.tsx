
import React, { useState, useMemo } from 'react';
import { 
  Search, RotateCcw, ChevronDown, CheckCircle2, 
  LayoutDashboard, ShoppingCart, Car, List, Settings, 
  Menu, Bell, User, Maximize2, Minimize2, RefreshCw, Layers,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, HelpCircle, ArrowLeft,
  Milestone, Share2, FileText, ArrowRightLeft
} from 'lucide-react';
import Timeline from './components/Timeline';
import EventDetailModal from './components/EventDetailModal';
import CreateEventModal from './components/CreateEventModal';
import EventContextMenu from './components/EventContextMenu';
import AssignVehicleModal from './components/AssignVehicleModal';
import NoteModal from './components/NoteModal';
import { MOCK_EVENTS, MOCK_GROUPS, MOCK_VEHICLES, checkOverlap } from './constants';
import { FleetEvent, EventType, Vehicle } from './types';
import { addDays, format, differenceInHours, differenceInDays } from 'date-fns';

// Polyfill startOfDay to fix import error
const startOfDay = (d: Date | number): Date => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const SidebarItem = ({ icon: Icon, label, active = false, hasSub = false }: any) => (
  <div className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-[#38bdf8] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSub && <ChevronDown size={14} />}
  </div>
);

const FilterLabel = ({ children }: {children?: React.ReactNode}) => (
  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">{children}</label>
);

const App: React.FC = () => {
  // Global State
  const [events, setEvents] = useState<FleetEvent[]>(MOCK_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(21); // Default to roughly a month/3 weeks
  const [viewScale, setViewScale] = useState<'day' | 'hour'>('day'); 
  const [selectedEvent, setSelectedEvent] = useState<FleetEvent | null>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    event: FleetEvent | null;
  }>({ isOpen: false, x: 0, y: 0, event: null });
  
  // Layout State
  const [isMaximized, setIsMaximized] = useState(false);

  // Creation State
  const [createModalData, setCreateModalData] = useState<{
    vehicle: Vehicle;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // Assign Vehicle Modal State
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    event: FleetEvent | null;
  }>({ isOpen: false, event: null });

  // Note Modal State
  const [noteModalData, setNoteModalData] = useState<{
    isOpen: boolean;
    event: FleetEvent | null;
  }>({ isOpen: false, event: null });

  // Filter States
  const [filters, setFilters] = useState({
    store: '',
    sipp: '',
    plate: '', 
    group: '',
    source: '', 
    status: '', 
    notes: '',
    orderId: '', 
    onlyWithBookings: false,
    oneWayOnly: false,     
    crossStoreOnly: false, 
  });

  // Legend Status Filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Toggle Logic
  const toggleStatusFilter = (key: string) => {
    setStatusFilters(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      return [...prev, key];
    });
  };

  // Creation Handlers
  const handleRangeSelect = (vehicle: Vehicle, start: Date, end: Date) => {
    setCreateModalData({ vehicle, startDate: start, endDate: end });
  };

  const handleCreateEvent = (newEventData: Partial<FleetEvent>) => {
    const newEvent: FleetEvent = {
      id: `new_${Date.now()}`,
      type: EventType.BLOCK, 
      groupId: '', 
      vehicleId: null, 
      startDate: new Date().toISOString(), 
      endDate: new Date().toISOString(),
      ...newEventData as any
    };
    setEvents(prev => [...prev, newEvent]);
    setCreateModalData(null);
  };

  // Update Event Handler (Locking, etc)
  const handleEventUpdate = (updatedEvent: FleetEvent) => {
     setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
     setSelectedEvent(prev => (prev && prev.id === updatedEvent.id ? updatedEvent : prev));
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to cancel/remove this event?')) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setSelectedEvent(null);
    }
  };

  // Complete Maintenance Logic
  const handleCompleteMaintenance = (event: FleetEvent) => {
      if (window.confirm('Mark this maintenance as completed?')) {
          handleEventUpdate({ ...event, status: 'Completed' });
          setSelectedEvent(null);
      }
  };

  // Move / Reassign Handler (Drag and Drop)
  const handleEventMove = (eventId: string, newVehicleId: string | null, newStart?: string, newEnd?: string) => {
    setEvents(prev => prev.map(e => {
        if (e.id !== eventId) return e;
        if (e.isLocked && newVehicleId !== null) return e; 

        const updatedEvent = { ...e, vehicleId: newVehicleId };
        
        if (e.type === EventType.BOOKING_UNASSIGNED && newVehicleId) {
             updatedEvent.type = EventType.BOOKING_ASSIGNED;
             updatedEvent.status = 'Confirmed';
        }
        
        if (newVehicleId === null) {
            updatedEvent.type = EventType.BOOKING_UNASSIGNED;
            updatedEvent.status = 'Pending Assignment';
        }

        if (newStart && newEnd) {
            updatedEvent.startDate = newStart;
            updatedEvent.endDate = newEnd;
        }

        return updatedEvent;
    }));
  };

  const handleAssignVehicleConfirm = (vehicleId: string) => {
     if (assignModalData.event) {
        handleEventMove(assignModalData.event.id, vehicleId);
     }
     setAssignModalData({ isOpen: false, event: null });
  };

  const handleNoteConfirm = (note: string) => {
     if (noteModalData.event) {
        handleEventUpdate({ ...noteModalData.event, notes: note });
     }
     setNoteModalData({ isOpen: false, event: null });
  };
  
  const handleEventClick = (event: FleetEvent, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Always open context menu on click (Left or Right)
    // This prioritizes the "Secondary Menu" display before actions
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      event
    });
  };
  
  // Handle Date Header Click (Switch to Day View)
  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewScale('hour');
    setDaysToShow(1);
  };

  const handleContextMenuAction = (action: 'LOCK' | 'DETAILS' | 'NOTES' | 'ASSIGN' | 'DELETE', event: FleetEvent) => {
    setContextMenu({ ...contextMenu, isOpen: false });
    
    switch(action) {
      case 'LOCK':
        handleEventUpdate({ ...event, isLocked: !event.isLocked });
        break;
      case 'DETAILS':
        setSelectedEvent(event);
        break;
      case 'NOTES':
        setNoteModalData({ isOpen: true, event });
        break;
      case 'ASSIGN':
        setAssignModalData({ isOpen: true, event });
        break;
      case 'DELETE':
        handleDeleteEvent(event.id);
        break;
    }
  };

  // Custom Range Handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const newStart = new Date(y, m - 1, d); // Construct date in local time
    setCurrentDate(newStart);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const newEnd = new Date(y, m - 1, d);
    
    // Calculate diff based on startOfDay to avoid time issues
    const diff = differenceInDays(newEnd, startOfDay(currentDate));
    if (diff > 0) {
        setDaysToShow(diff);
    }
  };

  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter(v => {
      if (filters.store && v.storeId !== filters.store) return false;
      if (filters.sipp && v.sipp !== filters.sipp) return false;
      if (filters.plate && !v.plate.includes(filters.plate)) return false;
      if (filters.group && v.groupId !== filters.group) return false;

      if (filters.onlyWithBookings) {
         const hasBooking = events.some(e => e.vehicleId === v.id && e.type === EventType.BOOKING_ASSIGNED);
         if (!hasBooking) return false;
      }
      return true;
    });
  }, [filters, events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
        if (statusFilters.length > 0) {
           const status = e.status?.toUpperCase() || '';
           const type = e.type;
           let match = false;
           // Filter Logic:
           // 1. Pending
           if (statusFilters.includes('PENDING') && type === EventType.BOOKING_UNASSIGNED) match = true;
           // 2. Assigned (Confirmed but not Picked Up)
           if (statusFilters.includes('ASSIGNED') && type === EventType.BOOKING_ASSIGNED && !status.includes('PICKED UP') && !status.includes('RETURNED')) match = true;
           // 3. Picked Up
           if (statusFilters.includes('PICKED_UP') && status.includes('PICKED UP')) match = true;
           // 4. Returned (Completed)
           if (statusFilters.includes('RETURNED') && (status.includes('RETURNED') || status.includes('COMPLETED'))) match = true;
           // 5. Maint
           if (statusFilters.includes('MAINT') && type === EventType.MAINTENANCE) match = true;
           // 6. Stop Sale
           if (statusFilters.includes('STOP') && type === EventType.STOP_SALE) match = true;
           
           // 7. Internal Use
           if (statusFilters.includes('INTERNAL') && type === EventType.BLOCK) {
               const r = e.reason?.toLowerCase() || '';
               if (!r.includes('operation') && !r.includes('ops') && !r.includes('lock')) match = true;
           }
           // 8. Ops Lock
           if (statusFilters.includes('OPS_LOCK') && type === EventType.BLOCK) {
               const r = e.reason?.toLowerCase() || '';
               if (r.includes('operation') || r.includes('ops') || r.includes('lock')) match = true;
           }
           
           if (!match) return false;
        }

        if (filters.notes && !e.notes?.toLowerCase().includes(filters.notes.toLowerCase())) return false;
        if (filters.orderId && !e.reservationId?.toLowerCase().includes(filters.orderId.toLowerCase())) return false;
        
        if (filters.oneWayOnly) {
           const isOneWay = e.pickupLocation && e.dropoffLocation && e.pickupLocation !== e.dropoffLocation;
           if (!isOneWay) return false;
        }

        if (filters.crossStoreOnly) {
           const vehicle = MOCK_VEHICLES.find(v => v.id === e.vehicleId);
           if (vehicle && e.pickupLocation && !e.pickupLocation.includes(vehicle.storeId)) {
              // keep
           } else if (e.type === EventType.BOOKING_ASSIGNED) {
              return false; 
           }
        }

        return true;
    });
  }, [events, filters, statusFilters]);

  const groupsToShow = useMemo(() => {
     const visibleGroupIds = new Set(filteredVehicles.map(v => v.groupId));
     const pendingGroups = events.filter(e => e.type === EventType.BOOKING_UNASSIGNED).map(e => e.groupId);
     pendingGroups.forEach(g => visibleGroupIds.add(g));

     return MOCK_GROUPS.filter(g => visibleGroupIds.has(g.id));
  }, [filteredVehicles, events]);


  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation - Hides when maximized */}
      {!isMaximized && (
        <div className={`w-16 md:w-56 flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 flex-shrink-0 z-20`}>
          <div className="h-16 flex items-center px-4 md:px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">F</div>
            <span className="ml-3 font-bold text-lg hidden md:block">FleetEdge</span>
          </div>
          
          <div className="flex-1 py-4 space-y-1 overflow-y-auto">
            <SidebarItem icon={LayoutDashboard} label="工作台" />
            <SidebarItem icon={ShoppingCart} label="订单管理" hasSub />
            <SidebarItem icon={Car} label="商品管理" hasSub />
            <SidebarItem icon={List} label="价格管理" hasSub />
            <SidebarItem icon={LayoutDashboard} label="库存管理" active hasSub />
            <div className="pl-4 md:pl-12 space-y-1 mt-1">
                <div className="px-4 py-2 text-sm text-slate-400 cursor-pointer hover:text-white">销售库存管理</div>
                <div className="px-4 py-2 text-sm text-blue-400 bg-slate-800/50 rounded-r-full font-medium cursor-pointer border-l-2 border-blue-400">车辆排单日历</div>
                <div className="px-4 py-2 text-sm text-slate-400 cursor-pointer hover:text-white">库存占用概览</div>
                <div className="px-4 py-2 text-sm text-slate-400 cursor-pointer hover:text-white">库存参数配置</div>
                <div className="px-4 py-2 text-sm text-slate-400 cursor-pointer hover:text-white">可用库存查询</div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800">
             <SidebarItem icon={Settings} label="系统设置" hasSub />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 min-w-0 overflow-hidden relative">
        
        {/* Top Header - HIDE WHEN MAXIMIZED */}
        {!isMaximized && (
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-10 shadow-sm">
            <div className="flex items-center">
                <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Menu size={20} /></button>
                <div className="ml-4 flex items-center text-sm text-gray-500">
                    <span>首页</span>
                    <ChevronRight size={14} className="mx-1" />
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">车辆排单日历</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">admin</span>
                    <ChevronDown size={14} className="text-gray-400" />
                </div>
            </div>
            </header>
        )}

        {/* Filters & Tools Bar */}
        <div className={`bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0 z-10 transition-all duration-300 ${isMaximized ? 'py-2' : 'space-y-4'}`}>
           
           {/* Row 1: Dropdowns - HIDE ON MAXIMIZE */}
           {!isMaximized && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <FilterLabel>Stores</FilterLabel>
                    <div className="relative">
                        <select 
                          value={filters.store} 
                          onChange={e => setFilters({...filters, store: e.target.value})}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none hover:border-gray-400 transition-colors"
                        >
                          <option value="">All Stores</option>
                          <option value="Narita">Narita Airport</option>
                          <option value="Haneda">Haneda Airport</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <FilterLabel>Car Group</FilterLabel>
                    <div className="relative">
                        <select 
                          value={filters.group} 
                          onChange={e => setFilters({...filters, group: e.target.value})}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none hover:border-gray-400 transition-colors"
                        >
                          <option value="">All Groups</option>
                          {MOCK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <FilterLabel>SIPP Code</FilterLabel>
                    <div className="relative">
                        <select 
                          value={filters.sipp} 
                          onChange={e => setFilters({...filters, sipp: e.target.value})}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none hover:border-gray-400 transition-colors"
                        >
                          <option value="">All SIPP</option>
                          <option value="ECMR">ECMR</option>
                          <option value="CDMR">CDMR</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <FilterLabel>Plate Number</FilterLabel>
                    <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search plate..." 
                          value={filters.plate}
                          onChange={e => setFilters({...filters, plate: e.target.value})}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-gray-400 transition-colors"
                        />
                        <Car size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <FilterLabel>Order / Work ID</FilterLabel>
                    <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Res / Work ID" 
                          value={filters.orderId}
                          onChange={e => setFilters({...filters, orderId: e.target.value})}
                          className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-gray-400 transition-colors"
                        />
                        <FileText size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <FilterLabel>Notes</FilterLabel>
                        <input 
                          type="text" 
                          placeholder="Notes" 
                          value={filters.notes}
                          onChange={e => setFilters({...filters, notes: e.target.value})}
                          className="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-gray-400 transition-colors"
                        />
                    </div>
                    <button className="h-[38px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Search size={16} /> Search
                    </button>
                    <button 
                      onClick={() => setFilters({store: '', sipp: '', plate: '', group: '', source: '', status: '', notes: '', orderId: '', onlyWithBookings: false, oneWayOnly: false, crossStoreOnly: false})}
                      className="h-[38px] px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                  </div>
              </div>
           )}

           {/* Row 2: Checkboxes & Controls */}
           <div className={`flex items-center justify-between ${!isMaximized ? 'pt-2 border-t border-gray-100' : ''}`}>
              
              {/* Checkboxes - HIDE ON MAXIMIZE */}
              {!isMaximized ? (
                 <div className="flex items-center gap-6 animate-in fade-in duration-200">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={filters.onlyWithBookings} onChange={e => setFilters({...filters, onlyWithBookings: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Show Booked Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={filters.oneWayOnly} onChange={e => setFilters({...filters, oneWayOnly: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:text-blue-600 transition-colors flex items-center gap-1">One-Way Only <ArrowRightLeft size={12}/></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={filters.crossStoreOnly} onChange={e => setFilters({...filters, crossStoreOnly: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide group-hover:text-blue-600 transition-colors flex items-center gap-1">Cross-Store Only <Share2 size={12}/></span>
                    </label>
                 </div>
              ) : (
                 // Spacer to keep controls on the right when filters are hidden
                 <div></div>
              )}

              {/* RESTORED TOOLBAR FROM SCREENSHOT 1 */}
              <div className="flex items-center gap-4">
                 {/* 1. Navigation Group */}
                 <div className="flex items-center rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden">
                    <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="px-2 py-1.5 hover:bg-gray-50 border-r border-gray-300 text-gray-600 flex items-center justify-center"><ChevronLeft size={16} /></button>
                    <button 
                       onClick={() => setCurrentDate(new Date())}
                       className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 bg-white"
                    >
                       Today
                    </button>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="px-2 py-1.5 hover:bg-gray-50 border-l border-gray-300 text-gray-600 flex items-center justify-center"><ChevronRight size={16} /></button>
                 </div>

                 {/* Divider */}
                 <div className="h-6 w-px bg-gray-300"></div>

                 {/* 2. View Switcher (Day/Week/Month) */}
                 <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200">
                    <button 
                       onClick={() => { setViewScale('hour'); setDaysToShow(1); }}
                       className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewScale === 'hour' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                       Day
                    </button>
                    <button 
                       onClick={() => { setViewScale('day'); setDaysToShow(7); }}
                       className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewScale === 'day' && daysToShow === 7 ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                       Week
                    </button>
                    <button 
                       onClick={() => { setViewScale('day'); setDaysToShow(30); }}
                       className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewScale === 'day' && daysToShow >= 28 ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                       Month
                    </button>
                 </div>

                 {/* Divider */}
                 <div className="h-6 w-px bg-gray-300"></div>

                 {/* 3. Custom Date Range - Styled to match Screenshot 1 */}
                 <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 bg-white shadow-sm hover:border-gray-400 transition-colors">
                     <span className="text-xs font-semibold text-gray-500 uppercase mr-1">Custom:</span>
                     <div className="flex items-center gap-2">
                         <div className="relative flex items-center">
                             <input 
                               type="date" 
                               value={format(currentDate, 'yyyy-MM-dd')}
                               onChange={handleStartDateChange}
                               className="text-sm font-medium text-gray-700 outline-none w-[110px] cursor-pointer bg-transparent" 
                             />
                             <CalendarIcon size={14} className="text-gray-400 absolute right-0 pointer-events-none bg-white pl-1" />
                         </div>
                         <span className="text-gray-400 font-medium">-</span>
                          <div className="relative flex items-center">
                             <input 
                               type="date" 
                               value={format(addDays(currentDate, daysToShow), 'yyyy-MM-dd')}
                               onChange={handleEndDateChange}
                               className="text-sm font-medium text-gray-700 outline-none w-[110px] cursor-pointer bg-transparent" 
                             />
                             <CalendarIcon size={14} className="text-gray-400 absolute right-0 pointer-events-none bg-white pl-1" />
                         </div>
                     </div>
                 </div>

                 <button onClick={() => setIsMaximized(!isMaximized)} className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}>
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                 </button>
              </div>
           </div>
        </div>

        {/* Timeline Container - Key Change: This container is flex-1 and overflow-hidden to constrain the Timeline component */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-50 relative">
           <Timeline 
              groups={groupsToShow}
              vehicles={filteredVehicles}
              events={filteredEvents}
              startDate={currentDate}
              daysToShow={daysToShow}
              viewScale={viewScale}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onRangeSelect={handleRangeSelect}
              onEventMove={handleEventMove}
              selectedStatusFilters={statusFilters}
              toggleStatusFilter={toggleStatusFilter}
           />
        </div>
      </div>

      {/* Modals & Overlays */}
      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        onUpdate={handleEventUpdate}
        getVehicle={(id) => MOCK_VEHICLES.find(v => v.id === id)}
        getGroup={(id) => MOCK_GROUPS.find(g => g.id === id)}
        onAssign={() => setAssignModalData({ isOpen: true, event: selectedEvent })}
        onAddNote={() => setNoteModalData({ isOpen: true, event: selectedEvent })}
        onDelete={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
        onComplete={() => selectedEvent && handleCompleteMaintenance(selectedEvent)}
        onEdit={() => console.log('Edit Maint')}
      />

      <CreateEventModal 
        isOpen={!!createModalData}
        onClose={() => setCreateModalData(null)}
        onConfirm={handleCreateEvent}
        initialData={createModalData}
      />

      <AssignVehicleModal
        isOpen={assignModalData.isOpen}
        event={assignModalData.event}
        vehicles={MOCK_VEHICLES}
        groups={MOCK_GROUPS}
        onClose={() => setAssignModalData({ isOpen: false, event: null })}
        onConfirm={handleAssignVehicleConfirm}
      />

      <NoteModal
        isOpen={noteModalData.isOpen}
        event={noteModalData.event}
        onClose={() => setNoteModalData({ isOpen: false, event: null })}
        onConfirm={handleNoteConfirm}
      />
      
      {/* Context Menu */}
      <EventContextMenu 
         isOpen={contextMenu.isOpen}
         position={{ x: contextMenu.x, y: contextMenu.y }}
         event={contextMenu.event}
         onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
         onAction={handleContextMenuAction}
      />

    </div>
  );
};

export default App;
