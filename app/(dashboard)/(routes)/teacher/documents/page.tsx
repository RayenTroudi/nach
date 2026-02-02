"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UploadButton } from "@/lib/upload-thing";
import { LeftSideBar } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "Visa",
  "Application",
  "Language",
  "Certificate",
  "Guide",
  "Template",
  "Other",
];

interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  tags: string[];
  downloads: number;
  isPublic: boolean;
  isForSale: boolean;
  price?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

export default function TeacherDocumentsPage() {
  const t = useTranslations("teacher.documents");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All"); // All, Public, Private
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    category: "Guide",
    tags: "",
    isPublic: true,
    isForSale: false,
    price: 0,
    currency: "eur",
  });

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents?limit=100&includePrivate=true");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || doc.category === categoryFilter;
    const matchesVisibility =
      visibilityFilter === "All" ||
      (visibilityFilter === "Public" && doc.isPublic) ||
      (visibilityFilter === "Private" && !doc.isPublic);
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fileUrl) {
      toast.error("Please upload a file first");
      return;
    }

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload document");
      }

      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        fileName: "",
        fileType: "",
        fileSize: 0,
        category: "Guide",
        tags: "",
        isPublic: true,
        isForSale: false,
        price: 0,
        currency: "eur",
      });
      fetchDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message);
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    try {
      const response = await fetch(`/api/documents/${editingDocument._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          isPublic: formData.isPublic,
          isForSale: formData.isForSale,
          price: formData.isForSale ? formData.price : 0,
          currency: formData.currency,
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");

      toast.success("Document updated successfully!");
      setIsEditModalOpen(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted successfully!");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Open edit modal
  const openEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      description: doc.description || "",
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      category: doc.category,
      tags: doc.tags.join(", "),
      isPublic: doc.isPublic,
      isForSale: doc.isForSale || false,
      price: doc.price || 0,
      currency: doc.currency || "eur",
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex">
        <LeftSideBar />
        <div className="flex flex-col gap-4 items-start w-full p-6 flex-1">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between py-2 border-b border-input w-full">
            <div className="flex flex-col gap-2">
              <Skeleton className="w-[200px] h-[36px]" />
              <Skeleton className="w-[300px] h-[20px]" />
            </div>
            <Skeleton className="w-[180px] h-[40px]" />
          </div>

          {/* Filters Skeleton */}
          <div className="w-full p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="flex-1 h-[40px]" />
              <Skeleton className="w-full md:w-[200px] h-[40px]" />
            </div>
          </div>

          {/* Documents Grid Skeleton */}
          <div className="grid gap-4 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full p-6 border rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Skeleton className="w-3/4 h-[24px] mb-2" />
                        <Skeleton className="w-full h-[16px]" />
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Skeleton className="w-[32px] h-[32px] rounded" />
                        <Skeleton className="w-[32px] h-[32px] rounded" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Skeleton className="w-[80px] h-[20px] rounded-full" />
                      <Skeleton className="w-[60px] h-[20px] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <LeftSideBar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {t('myDocuments')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('manageAndUpload')}
          </p>
        </div>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-red-500 hover:bg-brand-red-600">
              <Plus className="w-4 h-4 mr-2" />
              {t('uploadDocumentButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Share educational materials, guides, and templates with students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Visa Application Checklist"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the document..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="e.g., germany, visa, checklist"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Upload PDF Document *
                </label>
                {formData.fileUrl ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    <FileText className="w-5 h-5 text-brand-red-500" />
                    <span className="text-sm flex-1">{formData.fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          fileUrl: "",
                          fileName: "",
                          fileType: "",
                          fileSize: 0,
                        })
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="documentUpload"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setFormData({
                          ...formData,
                          fileUrl: res[0].url,
                          fileName: res[0].name,
                          fileType: "application/pdf",
                          fileSize: res[0].size,
                        });
                        toast.success("PDF uploaded successfully!");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Upload failed: ${error.message}`);
                    }}
                  />
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  PDF files only, max 8MB
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isForSale"
                  checked={formData.isForSale}
                  onChange={(e) =>
                    setFormData({ ...formData, isForSale: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isForSale" className="text-sm">
                  Make this document available for sale
                </label>
              </div>

              {formData.isForSale && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      required={formData.isForSale}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Currency *
                    </label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="tnd">TND</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this document public
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-brand-red-500 hover:bg-brand-red-600"
                >
                  Upload Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('allCategories')}</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Documents</SelectItem>
                <SelectItem value="Public">Public Only</SelectItem>
                <SelectItem value="Private">Private Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t('noDocumentsFound')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm || categoryFilter !== "All"
                ? t('tryAdjustingFilters')
                : t('uploadFirstDocument')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-lg">
                    <FileText className="w-6 h-6 text-brand-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {doc.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(doc)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Badge variant="outline">{doc.category}</Badge>
                      {doc.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 ml-auto">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {doc.downloads} downloads
                        </div>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant={doc.isPublic ? "default" : "secondary"}>
                          {doc.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update document information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Tags (comma separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsForSale"
                checked={formData.isForSale}
                onChange={(e) =>
                  setFormData({ ...formData, isForSale: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="editIsForSale" className="text-sm">
                Make this document available for sale
              </label>
            </div>

            {formData.isForSale && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required={formData.isForSale}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Currency *
                  </label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="tnd">TND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="editIsPublic" className="text-sm">
                Make this document public
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-red-500 hover:bg-brand-red-600"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
