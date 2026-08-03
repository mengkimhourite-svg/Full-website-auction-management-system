"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageOff } from "lucide-react";

interface ProductImageUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export default function ProductImageUpload({ value, onChange }: ProductImageUploadProps) {
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-gray-400 shrink-0">
          {value ? (
            <Image
              src={value}
              alt="Product preview"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <ImageOff size={24} />
          )}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
          >
            <Upload size={16} />
            {value ? "Change Image" : "Upload Image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
            >
              <X size={16} />
              Remove
            </button>
          )}
          <p className="text-xs text-gray-400">JPG or PNG, max 2MB</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
