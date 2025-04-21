import React from 'react';
import { Dialog } from 'primereact/dialog';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  color?: string;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className="p-0"
      header={
        <div className="relative py-3 px-4 flex items-center justify-between bg-blue-50">
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
      contentClassName="w-full max-w-full sm:max-w-md overflow-hidden bg-white p-0 text-left align-middle shadow-xl transition-all"
      modal
    >
      <div className="px-4 py-4">{children}</div>
    </Dialog>
  );
};

export default DetailModal;
