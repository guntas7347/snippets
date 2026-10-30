"use client";

import { useState, useRef, DragEvent } from "react";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "";
const CLOUDINARY_UPLOAD_PRESET = "";

interface CloudinaryUploaderProps {
  onUpload: (url: string) => void;
}

export default function CloudinaryUploader({
  onUpload,
}: CloudinaryUploaderProps) {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setSuccess(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setSuccess(false);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUpload(data.secure_url);
      setSuccess(true);
      setImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualUrl.trim()) {
      onUpload(manualUrl.trim());
      setManualUrl("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

    return (
      <div className="w-full">
      <input
      type="file"
      accept="image/*"
      ref={fileInputRef}
      onChange={handleFileSelect}
      className="hidden"
      />

      {/* Single unified card split into two halves */}
      <div className="flex items-stretch border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* ── Left: Dropzone ── */}
      <div
      onClick={() => !loading && !image && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-1 items-center gap-3 px-4 py-3 transition-all duration-200 ${
        isDragging
        ? "bg-blue-50"
        : image
        ? "bg-slate-50"
        : success && !image
        ? "bg-green-50"
        : "hover:bg-slate-50 cursor-pointer"
      }`}
      >
      {loading ? (
        <>
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
        <span className="text-xs font-semibold text-blue-600">
        Uploading…
        </span>
        </>
      ) : success && !image ? (
        <>
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <span className="text-xs font-semibold text-green-600 flex-1">
        Added!
        </span>
        <button
        onClick={(e) => {
          e.stopPropagation();
          setSuccess(false);
        }}
        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
        >
        Reset
        </button>
        </>
      ) : image ? (
        <>
        <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-xs font-semibold text-slate-700 truncate flex-1 min-w-0">
        {image.name}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
        <button
        onClick={clearSelection}
        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
        <X className="w-3.5 h-3.5" />
        </button>
        <button
        onClick={(e) => {
          e.stopPropagation();
          uploadImage();
        }}
        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-bold tracking-wide rounded-lg transition-colors"
        >
        Upload
        </button>
        </div>
        </>
      ) : (
        <>
        <div
        className={`p-1.5 rounded-lg shrink-0 transition-colors ${isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}
        >
        <UploadCloud className="w-4 h-4" />
        </div>
        <div>
        <p className="text-xs font-semibold text-slate-700">
        Upload a file
        </p>
        <p className="text-[10px] text-slate-400">
        Click or drag & drop
        </p>
        </div>
        </>
      )}
      </div>

      {/* ── Divider ── */}
      <div className="w-px bg-slate-200 shrink-0" />

      {/* ── Right: Manual URL input with inset button ── */}
      <div className="flex items-center w-56 lg:w-64 shrink-0 px-2 py-2 gap-2">
      <input
      type="text"
      value={manualUrl}
      onChange={(e) => setManualUrl(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
      placeholder="or paste URL…"
      className="flex-1 min-w-0 text-xs font-medium bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
      />
      <button
      onClick={handleManualSubmit}
      disabled={!manualUrl.trim()}
      className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-bold tracking-wide rounded-xl transition-all"
      >
      Add
      </button>
      </div>
      </div>
      </div>
    );
}
