import React, { useState, useEffect } from "react";
import { FolderPlus, X, Plus } from "@phosphor-icons/react";

interface AddChapterModalProps {
  open: boolean;
  nextOrder?: number;
  onClose: () => void;
  onSubmit: (chapter: { title: string; description?: string; order: number }) => void;
}

export function AddChapterModal({
  open,
  nextOrder = 1,
  onClose,
  onSubmit,
}: AddChapterModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Vui lòng nhập tên chương học");
      return;
    }
    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      order: nextOrder,
    });
    onClose();
  };

  const formattedOrder = String(nextOrder).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Centered Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-purple-100 flex items-start justify-between bg-purple-50/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-2xl shrink-0 shadow-2xs">
              <FolderPlus size={24} weight="fill" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Thêm chương học mới</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Thiết lập cấu trúc chương cho khóa học hiện tại
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition"
            title="Đóng modal"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Field 1: Tên chương học */}
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">
              Tên chương học <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-xl shadow-2xs">
              <span className="inline-flex items-center px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 font-medium text-xs shrink-0 select-none">
                Chương {formattedOrder}
              </span>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ví dụ: Lập trình Hướng đối tượng (OOP) trong Python..."
                className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
              />
            </div>
            {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
          </div>

          {/* Field 2: Mô tả tóm tắt chương */}
          <div>
            <label className="font-bold text-neutral-800 block mb-1.5">
              Mô tả tóm tắt chương <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập tóm tắt nội dung chính và kết quả đầu ra sau khi học viên hoàn thành chương học này..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-neutral-800 text-xs leading-relaxed focus:outline-none focus:border-purple-600 transition resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-neutral-50 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white grad-nebula shadow-nebula hover:opacity-95 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Thêm chương</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
