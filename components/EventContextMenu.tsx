
import React, { useEffect, useRef } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { FleetEvent, EventType } from '../types';

interface EventContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  event: FleetEvent | null;
  onClose: () => void;
  onAction: (action: 'LOCK' | 'DETAILS' | 'NOTES' | 'ASSIGN' | 'DELETE', event: FleetEvent) => void;
}

const EventContextMenu: React.FC<EventContextMenuProps> = ({ 
  isOpen, 
  position, 
  event, 
  onClose, 
  onAction 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  // Calculate position
  const style: React.CSSProperties = {
    top: position.y + 5,
    left: position.x,
  };

  const isLocked = !!event.isLocked;

  const handleAction = (e: React.MouseEvent, action: 'LOCK' | 'DETAILS' | 'NOTES' | 'ASSIGN' | 'DELETE') => {
      e.stopPropagation(); // Prevent bubbling
      onAction(action, event);
  };

  const renderMenuItems = () => {
    switch(event.type) {
      case EventType.MAINTENANCE:
        return (
          <>
            <button 
              onClick={(e) => handleAction(e, 'DETAILS')}
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 flex items-center justify-between transition-colors group"
            >
              <span>查看详情</span>
              <ExternalLink size={14} className="text-blue-600" />
            </button>
             <button 
              onClick={(e) => handleAction(e, 'NOTES')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>添加备注</span>
            </button>
             <button 
              onClick={(e) => handleAction(e, 'DELETE')} // Using delete to act as complete/remove for now
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>完成维修</span>
            </button>
          </>
        );

      case EventType.STOP_SALE:
        return (
          <>
            <button 
              onClick={(e) => handleAction(e, 'DETAILS')}
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 flex items-center justify-between transition-colors group"
            >
              <span>查看详情</span>
              <ExternalLink size={14} className="text-blue-600" />
            </button>
            <button 
              onClick={(e) => handleAction(e, 'DELETE')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Release Hold</span>
            </button>
          </>
        );
      
      case EventType.BLOCK:
        return (
          <>
            <button 
              onClick={(e) => handleAction(e, 'DETAILS')}
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 flex items-center justify-between transition-colors group"
            >
              <span>查看详情</span>
              <ExternalLink size={14} className="text-blue-600" />
            </button>
             <button 
              onClick={(e) => handleAction(e, 'NOTES')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>编辑备注</span>
            </button>
            <button 
              onClick={(e) => handleAction(e, 'DELETE')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>删除预占</span>
            </button>
          </>
        );

      default: // Reservations (Bookings)
        return (
          <>
            <button 
              onClick={(e) => handleAction(e, 'DETAILS')}
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 flex items-center justify-between transition-colors group"
            >
              <span>查看详情</span>
              <ExternalLink size={14} className="text-blue-600" />
            </button>

            <button 
              onClick={(e) => handleAction(e, 'ASSIGN')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>分配车辆</span>
            </button>

            <button 
              onClick={(e) => handleAction(e, 'NOTES')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>添加备注</span>
            </button>

            <button 
              onClick={(e) => handleAction(e, 'LOCK')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>{isLocked ? '解锁订单' : '锁定订单'}</span>
            </button>
          </>
        );
    }
  };

  return (
    <div 
      ref={menuRef}
      style={style}
      className="fixed z-[70] bg-white rounded-md shadow-xl border border-gray-100 min-w-[140px] py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden font-medium"
    >
      <div className="flex flex-col">
        {renderMenuItems()}
      </div>
    </div>
  );
};

export default EventContextMenu;
