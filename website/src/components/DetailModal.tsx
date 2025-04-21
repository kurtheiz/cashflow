import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
  children,
  color = '#3b82f6' // Default to blue-500 if no color provided
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-full sm:max-w-md transform overflow-hidden rounded-none sm:rounded-lg bg-white p-0 text-left align-middle shadow-xl transition-all">
                <div 
                  className="relative py-3 px-4 flex items-center justify-between" 
                  style={{ backgroundColor: color }}
                >
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white"
                    >
                      {title}
                    </Dialog.Title>
                    {subtitle && (
                      <p className="text-sm text-white text-opacity-90 mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 text-white hover:bg-white hover:bg-opacity-20 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailModal;
