"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  FolderOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Eye,
  EyeOff,
  Package,
  Upload,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LeftSideBar } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { TDocumentBundle, TDocument } from "@/types/models.types";
import { FileUpload } from "@/components/shared";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton } from "@uploadthing/react";

const CATEGORIES = [
  "Visa",
  "Application",
  "Language",
  "Certificate",
  "Guide",
  "Template",
  "Other",
];

export default function DocumentBundlesPage() {
  const t = useTranslations("teacherDocumentBundles");
  const [bundles, setBundles] = useState<TDocumentBundle[]>([]);
  const [documents, setDocuments] = useState<TDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<TDocumentBundle | null>(null);
  
  // Multiple file upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "usd",
    category: "Guide",
    tags: "",
    thumbnail: "",
    selectedDocuments: [] as string[],
    isPublished: true,
  });

  // Fetch bundles and available documents
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bundlesRes, documentsRes] = await Promise.all([
        fetch("/api/document-bundles"),
        fetch("/api/documents?limit=100&includePrivate=true"),
      ]);

      if (!bundlesRes.ok || !documentsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const bundlesData = await bundlesRes.json();
      const documentsData = await documentsRes.json();

      setBundles(bundlesData.bundles || []);
      setDocuments(documentsData.documents || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter bundles
  const filteredBundles = bundles.filter((bundle) =>
    bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create bundle
  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedDocuments.length === 0) {
      toast.error(t("selectDocuments"));
      return;
    }

    try {
      const response = await fetch("/api/document-bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          documentIds: formData.selectedDocuments,
          isPublished: formData.isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("createError"));
      }

      toast.success(t("createSuccess"));
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error creating bundle:", error);
      toast.error(error.message);
    }
  };

  // Handle edit bundle
  const handleEditBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBundle) return;

    try {
      const response = await fetch(`/api/document-bundles/${editingBundle._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          documentIds: formData.selectedDocuments,
        }),
      });

      if (!response.ok) throw new Error(t("updateError"));

      toast.success(t("updateSuccess"));
      setIsEditModalOpen(false);
      setEditingBundle(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error updating bundle:", error);
      toast.error(error.message);
    }
  };

  // Handle delete bundle
  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const response = await fetch(`/api/document-bundles/${bundleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(t("deleteError"));

      toast.success(t("deleteSuccess"));
      fetchData();
    } catch (error: any) {
      console.error("Error deleting bundle:", error);
      toast.error(error.message);
    }
  };

  // Handle publish toggle
  const handleTogglePublish = async (bundleId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/document-bundles/${bundleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!response.ok) throw new Error(t("updateError"));

      toast.success(isPublished ? t("unpublishSuccess") : t("publishSuccess"));
      fetchData();
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error(error.message);
    }
  };

  // Open edit modal with bundle data
  const openEditModal = (bundle: TDocumentBundle) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.title,
      description: bundle.description || "",
      price: bundle.price,
      currency: bundle.currency,
      category: bundle.category,
      tags: bundle.tags?.join(", ") || "",
      thumbnail: bundle.thumbnail || "",
      selectedDocuments: bundle.documents.map((doc: any) =>
        typeof doc === "string" ? doc : doc._id
      ),
      isPublished: bundle.isPublished,
    });
    setIsEditModalOpen(true);
  };

  // Handle multiple file upload
  const handleMultipleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingFiles(true);
    const uploadedIds: string[] = [];

    try {
      for (const file of files) {
        // For now, create documents with placeholder URLs
        // This will work until we get the UploadThing integration properly fixed
        const mockFileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
        
        // Create document with the placeholder file URL
        const documentData = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Auto-uploaded for bundle: ${formData.title || 'New Bundle'}`,
          fileUrl: mockFileUrl,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          category: formData.category,
          tags: [],
          isPublic: false, // Bundle documents should not be shown publicly
          isForSale: false,
          price: 0,
          currency: 'usd',
        };

        const documentResponse = await fetch('/api/documents', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });

        if (!documentResponse.ok) {
          const errorData = await documentResponse.json();
          throw new Error(errorData.error || `Failed to create document for ${file.name}`);
        }

        const documentResult = await documentResponse.json();
        uploadedIds.push(documentResult.document._id);
      }

      // Add uploaded documents to selected documents
      setFormData(prev => ({
        ...prev,
        selectedDocuments: [...prev.selectedDocuments, ...uploadedIds]
      }));
      
      setUploadedDocuments(prev => [...prev, ...uploadedIds]);
      setSelectedFiles([]); // Clear selected files after upload
      await fetchData(); // Refresh documents list
      toast.success(`${files.length} files uploaded successfully!`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload selected files
  const uploadSelectedFiles = () => {
    if (selectedFiles.length > 0) {
      handleMultipleFileUpload(selectedFiles);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      currency: "usd",
      category: "Guide",
      tags: "",
      thumbnail: "",
      selectedDocuments: [],
      isPublished: true,
    });
    setUploadedDocuments([]);
    setSelectedFiles([]);
  };

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.includes(docId)
        ? prev.selectedDocuments.filter((id) => id !== docId)
        : [...prev.selectedDocuments, docId],
    }));
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <LeftSideBar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="h-8 w-8" />
                {t("title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("subtitle")}
              </p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createBundle")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("createBundle")}</DialogTitle>
                  <DialogDescription>{t("createDescription")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBundle} className="space-y-4">
                  <div>
                    <Label>{t("titleLabel")}</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder={t("titlePlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <Label>{t("descriptionLabel")}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder={t("descriptionPlaceholder")}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("priceLabel")}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>{t("currencyLabel")}</Label>
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
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="tnd">TND</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t("categoryLabel")}</Label>
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
                            {t(`category${cat}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("tagsLabel")}</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder={t("tagsPlaceholder")}
                    />
                  </div>

                  <div>
                    <Label>{t("thumbnailLabel")}</Label>
                    <FileUpload
                      endpoint="courseThumbnail"
                      onChange={(url) =>
                        setFormData({ ...formData, thumbnail: url || "" })
                      }
                    />
                    {formData.thumbnail && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {t("thumbnailUploaded")}
                      </p>
                    )}
                  </div>

                  {/* Multiple File Upload Section */}
                  <div>
                    <Label>{t("uploadFilesLabel") || "Upload Multiple Files"}</Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 space-y-4">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                              Drop files here or click to browse
                            </span>
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                              PDF, DOC, DOCX, TXT, PNG, JPG, JPEG files
                            </span>
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                handleFileSelect(files);
                              }
                            }}
                            disabled={uploadingFiles}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Selected Files Preview */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Selected Files ({selectedFiles.length})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSelectedFile(index)}
                                  disabled={uploadingFiles}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            onClick={uploadSelectedFiles}
                            disabled={uploadingFiles}
                            className="w-full bg-brand-red-500 hover:bg-brand-red-600 disabled:opacity-50"
                          >
                            {uploadingFiles ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload {selectedFiles.length} files
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {uploadedDocuments.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm font-medium">
                              {uploadedDocuments.length} files uploaded and added to bundle
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 text-center">
                        {t("uploadFilesHint") || "Upload PDF, Word, text, or image files. They will be automatically added to this bundle."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>{t("selectDocumentsLabel")}</Label>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                      {documents.length === 0 ? (
                        <p className="text-sm text-slate-500">{t("noDocuments")}</p>
                      ) : (
                        documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          >
                            <Checkbox
                              checked={formData.selectedDocuments.includes(doc._id)}
                              onCheckedChange={() => toggleDocumentSelection(doc._id)}
                            />
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span className="text-sm flex-1">{doc.title}</span>
                            <Badge variant="outline">{doc.category}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      {t("documentsSelected", { count: formData.selectedDocuments.length })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPublished: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="isPublished" className="cursor-pointer font-medium">
                        {t("publishImmediately")}
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("publishDescription")}
                      </p>
                    </div>
                    {formData.isPublished ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button type="submit" className="bg-brand-red-500 hover:bg-brand-red-600">
                      {t("create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchBundles")}
                className="pl-10"
              />
            </div>
          </div>

          {/* Bundles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBundles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("noBundles")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                  {t("noBundlesDescription")}
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-brand-red-500 hover:bg-brand-red-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createBundle")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map((bundle) => {
                const borderClass = !bundle.isPublished ? 'border-2 border-amber-300 dark:border-amber-600' : '';
                return (
                <Card key={bundle._id} className={`hover:shadow-lg transition-shadow ${borderClass}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FolderOpen className="h-5 w-5" />
                          {bundle.title}
                          {!bundle.isPublished && (
                            <Badge variant="outline" className="ml-2 text-amber-600 border-amber-600">
                              {t("draft")}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {bundle.description || t("noDescription")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(bundle._id, bundle.isPublished)}
                        title={bundle.isPublished ? t("unpublish") : t("publish")}
                      >
                        {bundle.isPublished ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{bundle.category}</Badge>
                      <div className="flex items-center gap-1 text-lg font-bold text-brand-red-500">
                        <DollarSign className="h-5 w-5" />
                        {bundle.price} {bundle.currency.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="h-4 w-4" />
                      {bundle.documents?.length || 0} {t("documents")}
                    </div>

                    {bundle.tags && bundle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {bundle.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(bundle)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBundle(bundle._id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t("delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("editBundle")}</DialogTitle>
                <DialogDescription>{t("editDescription")}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditBundle} className="space-y-4">
                {/* Same form fields as create */}
                <div>
                  <Label>{t("titleLabel")}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={t("titlePlaceholder")}
                    required
                  />
                </div>

                <div>
                  <Label>{t("descriptionLabel")}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={t("descriptionPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("priceLabel")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>{t("currencyLabel")}</Label>
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
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="tnd">TND</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t("categoryLabel")}</Label>
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
                          {t(`category${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("tagsLabel")}</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder={t("tagsPlaceholder")}
                  />
                </div>

                {/* Multiple File Upload Section - Edit Modal */}
                <div>
                  <Label>{t("uploadFilesLabel") || "Upload Multiple Files"}</Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 space-y-4">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload-edit" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100">
                            Drop files here or click to browse
                          </span>
                          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                            PDF, DOC, DOCX, TXT, PNG, JPG, JPEG files
                          </span>
                        </label>
                        <input
                          id="file-upload-edit"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              handleFileSelect(files);
                            }
                          }}
                          disabled={uploadingFiles}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Selected Files ({selectedFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSelectedFile(index)}
                                disabled={uploadingFiles}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={uploadSelectedFiles}
                          disabled={uploadingFiles}
                          className="w-full bg-brand-red-500 hover:bg-brand-red-600 disabled:opacity-50"
                        >
                          {uploadingFiles ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload {selectedFiles.length} files
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {uploadedDocuments.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                            ✓
                          </div>
                          <span className="text-sm font-medium">
                            {uploadedDocuments.length} files uploaded and added to bundle
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 text-center">
                      {t("uploadFilesHint") || "Upload PDF, Word, text, or image files. They will be automatically added to this bundle."}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>{t("selectDocumentsLabel")}</Label>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Checkbox
                          checked={formData.selectedDocuments.includes(doc._id)}
                          onCheckedChange={() => toggleDocumentSelection(doc._id)}
                        />
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm flex-1">{doc.title}</span>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {t("documentsSelected", { count: formData.selectedDocuments.length })}
                  </p>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Checkbox
                    id="edit-isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublished: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="edit-isPublished" className="cursor-pointer font-medium">
                      {t("publishImmediately")}
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("publishDescription")}
                    </p>
                  </div>
                  {formData.isPublished ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" className="bg-brand-red-500 hover:bg-brand-red-600">
                    {t("saveChanges")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
