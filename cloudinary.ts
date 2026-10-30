"use server";

import "server-only";
import { createHash } from "node:crypto";
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} from "./config";

const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

const GALLERY_FOLDER_NAME = "fstd-gallery";

// Generate Cloudinary signature
function generateSignature(params: Record<string, string | number>) {
    const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

    return createHash("sha1")
    .update(`${sortedParams}${CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

// Upload image (signed)
export async function createImage(fileOrFormData: File | FormData) {
    let file: File;
    if (fileOrFormData instanceof FormData) {
        file = fileOrFormData.get("file") as File;
    } else {
        file = fileOrFormData;
    }

    if (!file) {
        throw new Error("No file provided for upload");
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
        folder: GALLERY_FOLDER_NAME,
        timestamp,
    };

    const signature = generateSignature(params);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", GALLERY_FOLDER_NAME);
    formData.append("signature", signature);

    const response = await fetch(`${BASE_URL}/image/upload`, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message ?? "Image upload failed");
    }

    return {
        publicId: result.public_id as string,
            url: result.secure_url as string,
            width: result.width as number,
            height: result.height as number,
            format: result.format as string,
    };
}

// Delete image (signed)
export async function deleteImage(publicId: string) {
    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
        public_id: publicId,
            timestamp,
    };

    const signature = generateSignature(params);

    const formData = new FormData();

    formData.append("public_id", publicId);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("signature", signature);

    const response = await fetch(`${BASE_URL}/image/destroy`, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();

    if (!response.ok || result.result !== "ok") {
        throw new Error(result.error?.message ?? "Image deletion failed");
    }

    return {
        success: true,
        publicId,
    };
}
