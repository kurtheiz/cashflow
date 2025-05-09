import React from 'react';
import { Dialog } from 'primereact/dialog';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  color?: string;
  modalType?: 'shift' | 'payDate';
  onDelete?: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  modalType,
  onDelete
}) => {
  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className="p-0 overflow-hidden"
      headerClassName="p-0 m-0 overflow-visible"
      style={{ width: '95vw', maxWidth: '600px', maxHeight: '80vh', margin: 0 }}
      breakpoints={{ '960px': '100vw', '640px': '100vw' }}
      pt={{ root: { style: { borderRadius: 0 } } }}
      header={
        <div className="sticky top-0 py-2 px-3 flex items-center justify-between bg-blue-50 z-10 border-b border-blue-100">
          <div>
            <h3 className="text-lg font-medium leading-6 text-blue-900">
              {title}
            </h3>
            {subtitle && (
              <div className="text-xs text-blue-700 font-normal mt-1">
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 p-1 rounded hover:bg-blue-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-blue-700" />
          </button>
        </div>
      }
      closable={false}
      maskClassName="bg-black bg-opacity-25"
      contentClassName="w-full max-w-full bg-white p-0 text-left align-middle shadow-xl transition-all overflow-hidden sm:rounded-lg"
      contentStyle={{ borderRadius: 0 }}
      modal
    >
      <div className="flex flex-col relative" style={{ maxHeight: '80vh' }}>
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, maxHeight: 'calc(80vh - 130px)' }}>
          <div className="px-3 pt-3 pb-2">
            {children}
          </div>
        </div>
        {/* Removed blur effect as requested */}
        
        <div className="px-3 py-3 border-t border-gray-200 bg-white mt-auto" style={{ position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          {modalType === 'shift' ? (
            <div className="flex space-x-2">
              <button 
                onClick={onDelete} 
                className="flex-1 bg-white text-red-600 py-2.5 px-4 border border-red-300 font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={onClose} 
                className="flex-1 py-2.5 px-4 bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose} 
              className="w-full py-2.5 px-4 bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default DetailModal;
