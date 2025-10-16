"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, ImageIcon, File } from "lucide-react"
import type { TaskFile } from "@/lib/types"
import { format } from "date-fns"

interface FileViewerDialogProps {
  file: TaskFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FileViewerDialog({ file, open, onOpenChange }: FileViewerDialogProps) {
  if (!file) return null

  const isImage = file.type.startsWith("image/")
  const isPDF = file.type === "application/pdf"
  const isText = file.type.startsWith("text/")

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.data
    link.download = file.name
    link.click()
  }

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6" />
    if (isPDF || isText) return <FileText className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{file.name}</DialogTitle>
              <DialogDescription>
                {(file.size / 1024).toFixed(1)} KB • Uploaded {format(new Date(file.uploadedAt), "MMM dd, yyyy")}
              </DialogDescription>
            </div>
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isImage && (
            <div className="rounded-lg overflow-hidden border bg-muted/50">
              <img src={file.data || "/placeholder.svg"} alt={file.name} className="w-full h-auto" />
            </div>
          )}

          {isPDF && (
            <div className="rounded-lg overflow-hidden border bg-muted/50">
              <iframe src={file.data} className="w-full h-[600px]" title={file.name} />
            </div>
          )}

          {isText && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{atob(file.data.split(",")[1])}</pre>
            </div>
          )}

          {!isImage && !isPDF && !isText && (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border bg-muted/50">
              <File className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">Preview not available</p>
              <p className="text-sm text-muted-foreground mb-4">This file type cannot be previewed</p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
