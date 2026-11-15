"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/lib/api";
import Cookies from "js-cookie";
import { TOKEN_COOKIE_KEY } from "@/lib/api";
import {
  ImportPreviewData,
  ImportExecuteResult,
  CRMFieldDefinition,
} from "@/types/crm";

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "LEADS" | "CONTACTS";
  title?: string;
  onSuccess?: () => void;
}

export function ExcelImportModal({
  open,
  onOpenChange,
  entityType,
  title = "Import from Excel / CSV Spreadsheet",
  onSuccess,
}: ExcelImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "map" | "result">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [defaultStatus, setDefaultStatus] = useState<string>("NEW");
  const [defaultSource, setDefaultSource] = useState<string>("OTHER");
  const [defaultPriority, setDefaultPriority] = useState<string>("MEDIUM");

  const [importResult, setImportResult] = useState<ImportExecuteResult | null>(null);

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setImportResult(null);
    setIsAnalyzing(false);
    setIsExecuting(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  // 1. Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const baseUrl = getApiBaseUrl();
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    const url = `${baseUrl}/imports/template?entity_type=${entityType}&format=xlsx`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download template");
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `crm_${entityType.toLowerCase()}_sample_template.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("Sample template downloaded");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to download template");
      });
  };

  // 2. Upload and Preview Spreadsheet
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsAnalyzing(true);

    try {
      const baseUrl = getApiBaseUrl();
      const token = Cookies.get(TOKEN_COOKIE_KEY);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_type", entityType);

      const res = await fetch(`${baseUrl}/imports/preview`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || json.message || "Failed to parse spreadsheet");
      }

      const data: ImportPreviewData = json.data;
      setPreviewData(data);
      setColumnMapping(data.suggested_mapping || {});
      setStep("map");
      toast.success(
        `Detected ${data.detected_columns.length} columns and ${data.total_detected_rows} rows.`
      );
    } catch (err: any) {
      toast.error(err.message || "Unable to read spreadsheet.");
      setSelectedFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Update Individual Column Mapping
  const handleMappingChange = (excelCol: string, crmTarget: string) => {
    setColumnMapping((prev) => {
      const updated = { ...prev };
      if (!crmTarget || crmTarget === "__skip__") {
        delete updated[excelCol];
      } else {
        updated[excelCol] = crmTarget;
      }
      return updated;
    });
  };

  // 4. Execute the Import Batch
  const handleExecuteImport = async () => {
    if (!selectedFile) return;
    setIsExecuting(true);

    try {
      const baseUrl = getApiBaseUrl();
      const token = Cookies.get(TOKEN_COOKIE_KEY);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("column_mapping", JSON.stringify(columnMapping));
      formData.append("entity_type", entityType);
      formData.append("default_status", defaultStatus);
      formData.append("default_source", defaultSource);
      formData.append("default_priority", defaultPriority);
      formData.append("default_currency", "INR");

      const res = await fetch(`${baseUrl}/imports/execute`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || json.message || "Import execution failed");
      }

      const result: ImportExecuteResult = json.data;
      setImportResult(result);
      setStep("result");

      // Invalidate relevant caches to refresh tables
      if (entityType === "LEADS") {
        queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
        queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      }

      if (onSuccess) onSuccess();
      toast.success(
        `Import complete: ${result.imported_count} records imported into CRM!`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to execute import.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} title={title}>
      <div className="space-y-5">
        {/* Step Indicator Progress */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                step === "upload"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </span>
            <span
              className={`text-xs ${
                step === "upload"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Upload Spreadsheet
            </span>
          </div>

          <ArrowRight className="h-3 w-3 text-muted-foreground/60" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                step === "map"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <span
              className={`text-xs ${
                step === "map"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Map Column Relations
            </span>
          </div>

          <ArrowRight className="h-3 w-3 text-muted-foreground/60" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                step === "result"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </span>
            <span
              className={`text-xs ${
                step === "result"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Results
            </span>
          </div>
        </div>

        {/* STEP 1: Upload File */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent/80 transition-colors p-8 rounded-sm text-center cursor-pointer bg-muted/10 hover:bg-accent/5 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3 group-hover:scale-105 transition-transform">
                {isAnalyzing ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>
              <h4 className="font-serif text-sm font-medium text-foreground">
                {isAnalyzing ? "Reading Spreadsheet & Headers..." : "Click or drag your spreadsheet here"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) and CSV (<strong>.csv</strong>)
              </p>
            </div>

            {/* Template Download Help Box */}
            <div className="p-3.5 bg-card border border-border rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <div className="text-xs font-medium text-foreground">
                    Need a reference template?
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Download our structured sample Excel file with sample Indian corporate rows.
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Interactive Column Mapping */}
        {step === "map" && previewData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                File: <strong className="text-foreground">{previewData.filename}</strong> (
                {previewData.total_detected_rows} rows detected)
              </div>
              <div className="text-[11px] font-mono text-accent">
                {Object.keys(columnMapping).length} columns mapped
              </div>
            </div>

            {/* Column Mapping Table */}
            <div className="border border-border rounded-sm overflow-hidden max-h-[340px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-left font-mono font-medium text-[11px] text-muted-foreground w-5/12">
                      YOUR SPREADSHEET COLUMN
                    </th>
                    <th className="p-2.5 text-center font-mono font-medium text-[11px] text-muted-foreground w-1/12">
                      →
                    </th>
                    <th className="p-2.5 text-left font-mono font-medium text-[11px] text-muted-foreground w-6/12">
                      CRM DESTINATION FIELD
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewData.detected_columns.map((colName) => {
                    const mappedField = columnMapping[colName] || "";
                    const sampleVal = previewData.sample_rows?.[0]?.[colName];

                    return (
                      <tr key={colName} className="hover:bg-muted/20">
                        <td className="p-2.5">
                          <div className="font-medium text-foreground">{colName}</div>
                          {sampleVal !== undefined && sampleVal !== "" && (
                            <div className="text-[10px] font-mono text-muted-foreground/80 truncate max-w-[200px] mt-0.5">
                              Sample: {String(sampleVal)}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground/60 font-mono">
                          →
                        </td>
                        <td className="p-2.5">
                          <Select
                            value={mappedField}
                            onChange={(e) => handleMappingChange(colName, e.target.value)}
                            className="h-8 text-xs"
                          >
                            <option value="__skip__">
                              — Skip / Save in Extra Notes —
                            </option>
                            <optgroup label="CRM Target Fields">
                              {previewData.available_crm_fields.map((f: CRMFieldDefinition) => (
                                <option key={f.field} value={f.field}>
                                  {f.label} ({f.field})
                                </option>
                              ))}
                            </optgroup>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Default Fallbacks for Unmapped Fields (Leads Only) */}
            {entityType === "LEADS" && (
              <div className="p-3 bg-muted/20 border border-border rounded-sm grid grid-cols-3 gap-3">
                <div>
                  <label className="micro-label block mb-1">Fallback Status</label>
                  <Select
                    value={defaultStatus}
                    onChange={(e) => setDefaultStatus(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                    <option value="WON">WON</option>
                    <option value="LOST">LOST</option>
                  </Select>
                </div>

                <div>
                  <label className="micro-label block mb-1">Fallback Source</label>
                  <Select
                    value={defaultSource}
                    onChange={(e) => setDefaultSource(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="OTHER">OTHER / EXCEL</option>
                    <option value="WEBSITE">WEBSITE</option>
                    <option value="REFERRAL">REFERRAL</option>
                    <option value="COLD_CALL">COLD_CALL</option>
                    <option value="EVENT">EVENT</option>
                  </Select>
                </div>

                <div>
                  <label className="micro-label block mb-1">Fallback Priority</label>
                  <Select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("upload")}
              >
                Back to File
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isExecuting}
                onClick={handleExecuteImport}
              >
                Import {previewData.total_detected_rows} Records
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Results Summary */}
        {step === "result" && importResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-sm border border-emerald-600/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <h4 className="font-serif font-medium text-sm text-foreground">
                  Data Import Successfully Completed!
                </h4>
                <p className="text-xs mt-1 leading-relaxed">
                  <strong>{importResult.imported_count}</strong> {entityType.toLowerCase()} records
                  have been created and are immediately available in your active CRM pipeline.
                </p>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-card border border-border rounded-sm text-center">
                <div className="micro-label">TOTAL ROWS</div>
                <div className="text-lg font-mono font-medium mt-1">
                  {importResult.total_rows}
                </div>
              </div>
              <div className="p-3 bg-card border border-border rounded-sm text-center">
                <div className="micro-label">IMPORTED</div>
                <div className="text-lg font-mono font-medium text-emerald-600 mt-1">
                  {importResult.imported_count}
                </div>
              </div>
              <div className="p-3 bg-card border border-border rounded-sm text-center">
                <div className="micro-label">SKIPPED / BLANK</div>
                <div className="text-lg font-mono font-medium text-muted-foreground mt-1">
                  {importResult.skipped_count}
                </div>
              </div>
            </div>

            {/* Error Diagnostics (if any) */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="border border-border rounded-sm p-3 bg-muted/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{importResult.errors.length} Row Notices</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-muted-foreground">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-bold text-foreground">Row {err.row_number}:</span>
                      <span>{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" size="sm" onClick={handleClose}>
                Done & View {entityType === "LEADS" ? "Leads" : "Contacts"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
