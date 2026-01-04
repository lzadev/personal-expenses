"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Plus, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Expense, ExpenseFormData } from "@/lib/types/expense";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";

interface AddExpenseDialogProps {
  categories: Category[];
  editingExpense?: Expense | null;
  onClose?: () => void;
}

// Helper to parse yyyy-MM-dd as local date
function parseLocalDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function AddExpenseDialog({
  categories,
  editingExpense,
  onClose,
}: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    currency: "DOP",
    category_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        amount: editingExpense.amount,
        currency: editingExpense.currency,
        category_id: editingExpense.category_id || "",
        date: editingExpense.date,
        description: editingExpense.description || "",
      });
      // Set preview for existing attachment
      if (editingExpense.attachment_url) {
        setPreviewUrl(editingExpense.attachment_url);
      }
      setRemoveExistingAttachment(false);
      setOpen(true);
    }
  }, [editingExpense]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, WEBP) or PDF file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Compress image if it's an image file
    let fileToStore = file;
    if (file.type.startsWith('image/')) {
      console.log('Starting compression for:', file.name, 'Original size:', (file.size / 1024).toFixed(2), 'KB');
      try {
        toast.loading('Compressing image...');
        const options = {
          maxSizeMB: 0.3, // Max 300KB to stay well under 1MB limit
          maxWidthOrHeight: 1200, // Max dimension
          useWebWorker: true,
          fileType: 'image/jpeg', // Convert to JPEG for better compression
        };
        console.log('Calling imageCompression with options:', options);
        fileToStore = await imageCompression(file, options);
        console.log('Compression complete! New size:', (fileToStore.size / 1024).toFixed(2), 'KB');
        toast.dismiss();

        // Check if still too large
        if (fileToStore.size > 900 * 1024) { // 900KB safety margin
          toast.error(`Compressed file still too large: ${(fileToStore.size / 1024).toFixed(0)}KB. Try a smaller image.`);
          return;
        }

        toast.success(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToStore.size / 1024).toFixed(0)}KB`);
      } catch (error) {
        toast.dismiss();
        console.error('Error compressing image:', error);
        toast.error('Failed to compress image');
        return;
      }
    }

    console.log('Setting selectedFile to:', fileToStore.name, 'Size:', (fileToStore.size / 1024).toFixed(2), 'KB');
    setSelectedFile(fileToStore);

    // Create preview for images
    if (fileToStore.type.startsWith('image/')) {
      const url = URL.createObjectURL(fileToStore);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    // If editing and there's an existing attachment, mark it for removal
    if (editingExpense?.attachment_url) {
      setRemoveExistingAttachment(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log file size for debugging
      // if (selectedFile) {
      //   console.log('Uploading file:', selectedFile.name, 'Size:', (selectedFile.size / 1024).toFixed(2), 'KB');
      //   if (selectedFile.size > 1024 * 1024) {
      //     toast.error(`File too large: ${(selectedFile.size / 1024).toFixed(0)}KB. Must be under 1MB.`);
      //     setLoading(false);
      //     return;
      //   }
      // }

      const dataToSubmit = {
        ...formData,
        attachment: selectedFile || undefined,
        removeAttachment: removeExistingAttachment,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, dataToSubmit);
        toast.success("Expense updated successfully!");
      } else {
        await createExpense(dataToSubmit);
        toast.success("Expense added successfully!");
      }

      setOpen(false);
      setFormData({
        amount: 0,
        currency: "DOP",
        category_id: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setRemoveExistingAttachment(false);
      onClose?.();
    } catch (error) {
      console.error("Failed to save expense:", error);
      toast.error("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormData({
        amount: 0,
        currency: "USD",
        category_id: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-fb-blue hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover-lift rounded-xl h-11 px-6 font-semibold">
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 sm:max-w-[500px] max-h-[90vh] overflow-y-auto animate-scale-in glass-card border-gray-200 dark:border-gray-700">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-fb-blue flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                {editingExpense
                  ? "Update the expense details below."
                  : "Enter the details of your expense."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label
                htmlFor="amount"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] transition-all"
              />
            </div>
            <div className="grid gap-2.5">
              <Label
                htmlFor="currency"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
                required
              >
                <SelectTrigger
                  id="currency"
                  className="w-full !h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOP">DOP ($)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label
                htmlFor="category"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Category
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                required
              >
                <SelectTrigger
                  id="category"
                  className="w-full !h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        {category.icon && <span>{category.icon}</span>}
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label
                htmlFor="date"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(parseLocalDate(formData.date)!, "MMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={
                      formData.date ? parseLocalDate(formData.date) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setFormData({
                          ...formData,
                          date: format(date, "yyyy-MM-dd"),
                        });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2.5">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Description (optional)
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="h-11 rounded-xl bg-gray-50 dark:bg-[#3A3B3C] border-gray-200 dark:border-gray-700 focus-visible:ring-[#1877F2] transition-all"
              />
            </div>

            {/* Attachment Upload */}
            <div className="grid gap-2.5">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Receipt (optional)
              </Label>

              {!selectedFile && !previewUrl ? (
                <label
                  htmlFor="attachment"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#1877F2] dark:hover:border-[#1877F2] transition-all bg-gray-50 dark:bg-[#3A3B3C]"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    JPG, PNG, WEBP or PDF (max 5MB)
                  </span>
                  <input
                    id="attachment"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-[#3A3B3C]">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {previewUrl && selectedFile?.type.startsWith('image/') ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 rounded-lg object-contain"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile.name}
                      </span>
                    </div>
                  ) : previewUrl && !selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Existing attachment"
                        className="max-h-40 rounded-lg object-contain"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Existing attachment
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FileText className="h-10 w-10 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF Document
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="gradient-fb-blue hover:opacity-90 text-white h-11 px-6 rounded-xl font-semibold transition-all hover-lift"
            >
              {loading
                ? "Saving..."
                : editingExpense
                  ? "Update Expense"
                  : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
