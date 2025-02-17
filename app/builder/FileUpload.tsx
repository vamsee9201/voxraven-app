"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, X, FileIcon, AlertCircle } from "lucide-react"

interface FileUploadProps {
  maxFiles?: number
}

const FileUpload: React.FC<FileUploadProps> = ({ maxFiles = Number.POSITIVE_INFINITY }) => {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...newFiles]
        if (updatedFiles.length > maxFiles) {
          setError(`You can only upload a maximum of ${maxFiles} file${maxFiles !== 1 ? "s" : ""}.`)
          return prevFiles
        }
        setError(null)
        return updatedFiles.slice(0, maxFiles)
      })
    },
    [maxFiles],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    [addFiles],
  )

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files)
        addFiles(selectedFiles)
      }
    },
    [addFiles],
  )

  const removeFile = useCallback((fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
    setError(null)
  }, [])

  const uploadFiles = () => {
    // Implement your file upload logic here
    console.log("Uploading files:", files)
  }

  const isMaxFilesReached = files.length >= maxFiles

  return (
    <div className="max-w-md mx-auto mt-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive
            ? "border-primary bg-primary/10"
            : isMaxFilesReached
              ? "border-gray-300 bg-gray-100"
              : "border-gray-300"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={onFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isMaxFilesReached}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center justify-center ${isMaxFilesReached ? "opacity-50" : ""}`}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-md font-semibold mb-1">
            {isMaxFilesReached ? "Maximum files reached" : "Drag & Drop files here"}
          </p>
          <p className="text-sm text-gray-500">
            {isMaxFilesReached ? `Max ${maxFiles} file${maxFiles !== 1 ? "s" : ""}` : "or click to select files"}
          </p>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <div className="flex items-center overflow-x-auto">
                  <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <div className="text-sm">{file.name}</div>
                </div>
                <button onClick={() => removeFile(file)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          className="mt-4 w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors"
        >
          Upload Files
        </button>
      )}
    </div>
  )
}

export default FileUpload

