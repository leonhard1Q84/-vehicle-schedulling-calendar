
import React from 'react';
import { X, User, Calendar, Lock, Unlock, Phone, Mail, PackagePlus, CarFront, CheckCircle, Trash2, FileEdit, FileText, ArrowRightLeft, Wrench, Copy } from 'lucide-react';
import { EventModalProps, EventType } from '../types';
import { EVENT_LABELS } from '../constants';

interface ExtendedEventModalProps extends EventModalProps {
  onAssign?: () => void;
  onAddNote?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
}

const EventDetailModal: React.FC<ExtendedEventModalProps> = ({ 
  event, 
  onClose, 
  onUpdate, 
  getVehicle, 
  getGroup,
  onAssign,
  onAddNote,
  onDelete,
  onComplete,
  onEdit
}) => {
  if (!event) return null;

  const vehicle = getVehicle(event.vehicleId);
  const group = getGroup(event.groupId);

  // Format Date Helper
  const fmt = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Handle Lock Toggle
  const toggleLock = () => {
    onUpdate({
      ...event,
      isLocked: !event.isLocked
    });
  };

  const handleCopyOrderCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.reservationId) {
       navigator.clipboard.writeText(event.reservationId);
    }
  };

  const isLocked = !!event.isLocked;
  // Only allow locking for Assigned Bookings
  const canLock = event.type === EventType.BOOKING_ASSIGNED; 

  // --- Render Content Sections ---

  const renderBookingContent = () => (
    <div className="space-y-6">
      {/* Top Row: Order Code & Status */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Order Code</label>
          <div 
             className="font-mono text-lg font-bold text-blue-700 flex items-center gap-2 cursor-pointer group hover:underline underline-offset-2 decoration-blue-700 decoration-1"
             title="Click to view full order details"
             onClick={() => console.log("Navigate to order details")}
          >
              {event.reservationId}
              <button 
                 onClick={handleCopyOrderCode}
                 className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                 title="Copy Order Code"
              >
                  <Copy size={14} />
              </button>
          </div>
        </div>
        <div>
           <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
             Status
           </label>
           <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${isLocked ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
              {event.status || 'Confirmed'}
           </div>
        </div>
      </div>

      {/* Customer Section & Reserved Model */}
      <div className="px-1 flex justify-between gap-4">
        <div className="flex-1">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-2">
            <User size={14} /> Customer Info
            </label>
            <div>
                <div className="text-lg font-bold text-gray-800">{event.customerName}</div>
                <div className="mt-1 space-y-1">
                    {event.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        <span>{event.customerPhone}</span>
                    </div>
                    )}
                    {event.customerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={12} className="text-gray-400" />
                        <span>{event.customerEmail}</span>
                    </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 border-l border-gray-100 pl-4">
             <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 mb-2">
                <CarFront size={12} /> Reserved Model
             </label>
             <div className="font-bold text-gray-800 text-base">
                {event.modelPreference || vehicle?.model || group?.name}
             </div>
             <div className="text-xs text-gray-400 mt-1">or similar category</div>
        </div>
      </div>

      {/* Date & Location */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
            <Calendar size={14} /> Pickup
          </label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.startDate)}</div>
          <div className="text-xs text-gray-500 mt-0.5">{event.pickupLocation}</div>
        </div>
        <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
            <Calendar size={14} /> Dropoff
          </label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.endDate)}</div>
          <div className="text-xs text-gray-500 mt-0.5">{event.dropoffLocation}</div>
        </div>
      </div>

      {/* Extras */}
      <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-2">
            <PackagePlus size={14} /> Extras / Add-ons
          </label>
          {event.extras && event.extras.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {event.extras.map((extra, i) => {
                  const parts = extra.split('*');
                  const name = parts[0].trim();
                  const qty = parts.length > 1 ? parts[1].trim() : '';

                  return (
                    <span key={i} className="flex items-center overflow-hidden rounded border border-gray-200 text-xs font-medium">
                        <span className="bg-gray-50 px-2 py-1 text-gray-600">{name}</span>
                        {qty && (
                            <span className="bg-blue-50 px-2 py-1 text-blue-700 font-bold border-l border-gray-200">
                                x{qty}
                            </span>
                        )}
                    </span>
                  );
                })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">No extras selected</div>
          )}
      </div>
    </div>
  );

  const renderMaintenanceContent = () => (
    <div className="space-y-6">
      <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
            <Wrench size={20} />
         </div>
         <div>
            <div className="text-orange-800 font-bold">Maintenance</div>
            <div className="text-orange-600/70 text-xs mt-0.5">Vehicle unavailable for bookings.</div>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 pt-2">
          <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Start</label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.startDate)}</div>
        </div>
        <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Est. Completion</label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.endDate)}</div>
        </div>
      </div>
    </div>
  );

  const renderStopSaleContent = () => (
    <div className="space-y-6">
       
       <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
             <Lock size={20} />
          </div>
          <div>
             <div className="text-orange-800 font-bold">Temporary Hold</div>
             <div className="text-orange-600/70 text-xs mt-0.5">Inventory buffer for operational use.</div>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6 pt-2">
          <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">From</label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.startDate)}</div>
        </div>
        <div>
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">To</label>
          <div className="text-sm font-bold text-gray-800">{fmt(event.endDate)}</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (event.type) {
      case EventType.BOOKING_ASSIGNED:
      case EventType.BOOKING_UNASSIGNED:
        return renderBookingContent();
      case EventType.MAINTENANCE:
        return renderMaintenanceContent();
      case EventType.STOP_SALE:
        return renderStopSaleContent();
      default: // BLOCK
         return (
          <div className="space-y-4">
             <div>
                <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
                  <Lock size={14} /> Internal Hold
                </label>
                <div className="text-purple-700 font-semibold bg-purple-50 p-3 rounded border border-purple-100">{event.reason}</div>
            </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Start</label>
                <div>{fmt(event.startDate)}</div>
              </div>
              <div>
                <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">End</label>
                <div>{fmt(event.endDate)}</div>
              </div>
            </div>
          </div>
        );
    }
  };

  // --- Render Footer Actions ---

  const renderFooter = () => {
    const isBooking = event.type === EventType.BOOKING_ASSIGNED || event.type === EventType.BOOKING_UNASSIGNED;
    const isMaintenance = event.type === EventType.MAINTENANCE;
    const isStopSale = event.type === EventType.STOP_SALE;

    if (isBooking) {
      return (
        <>
          <button 
             onClick={onAddNote}
             className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
             <FileText size={16} /> 添加备注
          </button>
          <button 
             onClick={onAssign}
             className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
             <ArrowRightLeft size={16} /> 分配车辆
          </button>
        </>
      );
    }

    if (isMaintenance) {
      return (
        <>
          <button 
             onClick={onEdit}
             className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
             <FileEdit size={16} /> 修改工期
          </button>
          <button 
             onClick={onComplete}
             className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
             <CheckCircle size={16} /> 完成维修
          </button>
        </>
      );
    }

    if (isStopSale) {
      return (
        <>
          <button 
             onClick={onDelete} 
             className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2 ml-auto"
          >
             <Trash2 size={16} /> Release Hold
          </button>
        </>
      );
    }

    // Default
    return (
       <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm">Close</button>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white text-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50/80 px-6 py-4 flex justify-between items-start border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                 event.type === EventType.BOOKING_UNASSIGNED ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                 event.type === EventType.MAINTENANCE ? 'bg-orange-100 text-orange-700 border-orange-200' :
                 event.type === EventType.STOP_SALE ? 'bg-orange-100 text-orange-700 border-orange-200' :
                 'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {EVENT_LABELS[event.type]}
              </span>
              {vehicle ? (
                <span className="text-gray-500 text-sm font-mono font-semibold">{vehicle.plate}</span>
              ) : (
                <span className="text-red-500 text-sm font-mono italic">Unassigned</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{group?.name}</h2>
            {vehicle && <div className="text-xs text-gray-500 mt-0.5">{vehicle.model} • {vehicle.color}</div>}
          </div>
          
          <div className="flex gap-2">
             {canLock && (
                <button 
                  onClick={toggleLock}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 border ${isLocked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}
                  title={isLocked ? "Unlock Vehicle" : "Lock Vehicle"}
                >
                    {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
             )}

             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {renderContent()}

          {event.notes && (
             <div className="mt-6 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100">
                <label className="text-yellow-600/80 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
                  <FileText size={12} /> Notes
                </label>
                <p className="text-sm text-gray-700">{event.notes}</p>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
