"use client";

import { useEffect } from "react";
import { AlertTriangle, Info, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

const variantConfig = {
  danger: {
    icon: <Trash2 size={24} />,
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    btnBg: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    btnBg: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: <Info size={24} />,
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    btnBg: "bg-indigo-600 hover:bg-indigo-700",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-xl ${config.iconBg} ${config.iconText} flex items-center justify-center mb-4`}>
            {config.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">{message}</p>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white ${config.btnBg} rounded-xl transition-all`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
