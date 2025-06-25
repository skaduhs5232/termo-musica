'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Image */}
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain"
            unoptimized
            priority
          />
        </div>
        
        {/* Caption */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
            {alt}
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pressione ESC ou clique fora da imagem para fechar
          </p>
        </div>
      </div>
    </div>
  );
}
