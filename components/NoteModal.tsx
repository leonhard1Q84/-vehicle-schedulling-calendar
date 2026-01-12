
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { FleetEvent } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  event: FleetEvent | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ 
  isOpen, 
  event, 
  onClose, 
  onConfirm 
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      setNote(event.notes || '');
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded text-blue-600">
            <FileText size={18} />
          </div>
          <div>
             <h3 className="text-gray-700 font-bold text-base">添加备注 (Add Notes)</h3>
             <p className="text-xs text-gray-400">{event.reservationId}</p>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">备注内容:</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入备注信息... (Enter notes)"
            className="w-full h-32 text-sm border border-gray-300 rounded p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white resize-none"
            autoFocus
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            保存备注
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
