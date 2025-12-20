"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
    onImageSelect: (base64: string) => void;
    currentImage?: string;
}

export default function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setPreview(base64);
            onImageSelect(base64);
        };
        reader.readAsDataURL(file);
    }, [onImageSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        onImageSelect("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="mt-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ display: "none" }}
            />

            {preview ? (
                <div className="file-preview">
                    <img src={preview} alt="Preview" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="file-preview-remove"
                        aria-label="Remove image"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div
                    className={`file-upload ${isDragOver ? "dragover" : ""}`}
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="file-upload-icon">📷</div>
                    <p className="file-upload-text">
                        Drag and drop an image, or click to select
                    </p>
                    <p className="file-upload-hint">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
            )}
        </div>
    );
}
