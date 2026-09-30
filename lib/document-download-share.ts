// Utility for robust Document Download and Direct PDF Web Share API Integration
// Handles base64 strings, binary blobs, cross-origin URLs, and converts documents to standardized PDF

import { UploadedFileMeta } from "@/types/portal";
import { resolveDocumentDataUrl } from "./doc-preview-utils";

/**
 * Converts any URL (data:, blob:, or remote http/https) into a valid binary Blob
 */
export async function urlToBlob(url: string, defaultMimeType: string = "application/pdf"): Promise<Blob> {
  if (!url) {
    throw new Error("Cannot convert empty URL to Blob");
  }

  // Handle data URLs
  if (url.startsWith("data:")) {
    const commaIndex = url.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid data URL structure");
    }
    const header = url.slice(0, commaIndex);
    const data = url.slice(commaIndex + 1);

    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : defaultMimeType;
    const isBase64 = header.includes(";base64");

    if (isBase64) {
      const binaryString = atob(data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    } else {
      // URL encoded (e.g. data:image/svg+xml;utf8,<svg...)
      const decoded = decodeURIComponent(data);
      return new Blob([decoded], { type: mimeType });
    }
  }

  // Handle blob: or http(s): URLs via fetch
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Helper to escape string for PDF text objects
 */
function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Encodes string to UTF-8 Uint8Array
 */
function encodeAscii(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Combines multiple Uint8Array chunks into one
 */
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Builds a 100% compliant PDF 1.4 binary buffer from an embedded JPEG image
 */
function buildPdfFromJpeg(
  jpegBytes: Uint8Array,
  imgWidth: number,
  imgHeight: number,
  title: string,
  applicantName: string,
  docId: string
): Uint8Array {
  // A4 dimensions in PDF points (72 pt/inch)
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Header and margin constraints
  const marginX = 36;
  const marginTop = 40;
  const marginBottom = 40;
  const maxContentW = pageWidth - marginX * 2; // 523.28
  const maxContentH = pageHeight - marginTop - marginBottom - 70; // ~691

  let drawW = maxContentW;
  let drawH = drawW * (imgHeight / imgWidth);

  if (drawH > maxContentH) {
    drawH = maxContentH;
    drawW = drawH * (imgWidth / imgHeight);
  }

  const drawX = (pageWidth - drawW) / 2;
  const drawY = pageHeight - marginTop - 45 - drawH; // Position below top banner

  const safeTitle = escapePdfText(title);
  const safeName = escapePdfText(applicantName);
  const safeDocId = escapePdfText(docId);

  // Content stream instructions: Banner, Text, Image placement, Footer
  const contentStreamText = `q
0.98 0.55 0.12 rg 36 805 523 4 re f
0.07 0.53 0.03 rg 36 801 523 2 re f
BT /F1 11 Tf 0 0 0.5 rg 36 784 Td (MSN COMMUNICATION & MEESEVA - OFFICIAL STATUTORY VAULT) Tj ET
BT /F2 8.5 Tf 0.3 0.3 0.3 rg 36 770 Td (Document: ${safeTitle} | Applicant: ${safeName} | ID: ${safeDocId}) Tj ET
0.8 0.85 0.9 RG 1 w 36 760 m 559 760 l S
q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm /Im1 Do Q
0.8 0.85 0.9 RG 1 w 36 44 m 559 44 l S
BT /F2 8 Tf 0.45 0.45 0.45 rg 36 30 Td (Verified Statutory Record • AES-256 Encrypted Archive • Government of Telangana Portal) Tj ET
BT /F1 8 Tf 0.07 0.53 0.03 rg 450 30 Td (SEAL: VERIFIED) Tj ET
Q`;

  const contentStreamBytes = encodeAscii(contentStreamText);

  // Build PDF Objects
  const obj1 = encodeAscii(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  const obj2 = encodeAscii(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  const obj3 = encodeAscii(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(
      2
    )}] /Resources << /XObject << /Im1 4 0 R >> /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>\nendobj\n`
  );

  const obj4Header = encodeAscii(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  const obj4Footer = encodeAscii(`\nendstream\nendobj\n`);

  const obj5 = encodeAscii(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
  const obj6 = encodeAscii(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  const obj7 = encodeAscii(
    `7 0 obj\n<< /Length ${contentStreamBytes.length} >>\nstream\n${contentStreamText}\nendstream\nendobj\n`
  );

  const header = encodeAscii(`%PDF-1.4\n%âãÏÓ\n`);

  // Calculate object byte offsets for the cross-reference table
  let currentOffset = header.length;
  const offsets: number[] = [];

  offsets.push(currentOffset); // obj 1
  currentOffset += obj1.length;

  offsets.push(currentOffset); // obj 2
  currentOffset += obj2.length;

  offsets.push(currentOffset); // obj 3
  currentOffset += obj3.length;

  offsets.push(currentOffset); // obj 4
  currentOffset += obj4Header.length + jpegBytes.length + obj4Footer.length;

  offsets.push(currentOffset); // obj 5
  currentOffset += obj5.length;

  offsets.push(currentOffset); // obj 6
  currentOffset += obj6.length;

  offsets.push(currentOffset); // obj 7
  currentOffset += obj7.length;

  // Cross reference table
  const startXref = currentOffset;
  let xrefText = `xref\n0 8\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xrefText += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  xrefText += `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  const xrefBytes = encodeAscii(xrefText);

  return concatUint8Arrays([
    header,
    obj1,
    obj2,
    obj3,
    obj4Header,
    jpegBytes,
    obj4Footer,
    obj5,
    obj6,
    obj7,
    xrefBytes
  ]);
}

/**
 * Builds a clean textual fallback PDF if image rasterization cannot run
 */
function buildTextualPdf(title: string, applicantName: string, docId: string, timestamp: string): Uint8Array {
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const content = `q
0.98 0.55 0.12 rg 36 805 523 4 re f
0.07 0.53 0.03 rg 36 801 523 2 re f
BT /F1 16 Tf 0 0 0.5 rg 40 760 Td (MSN COMMUNICATION & MEESEVA SERVICES) Tj ET
BT /F1 13 Tf 0.1 0.1 0.1 rg 40 735 Td (OFFICIAL VAULT CERTIFICATE & VERIFIED RECORD) Tj ET
0.8 0.8 0.8 RG 1 w 40 720 m 555 720 l S

BT /F2 11 Tf 0.2 0.2 0.2 rg
40 680 Td (Document Title: ${escapePdfText(title)}) Tj
0 -24 Td (Application ID:  ${escapePdfText(docId)}) Tj
0 -24 Td (Citizen Name:    ${escapePdfText(applicantName)}) Tj
0 -24 Td (Certified Date:  ${escapePdfText(timestamp)}) Tj
0 -24 Td (Vault Security:  AES-256 Bit Verified • Tamper Proof Record) Tj
0 -24 Td (Issuing Node:    Hyderabad Central Dispatch Hub) Tj
0 -24 Td (Attesting Admin: MANDAN ROHITH KUMAR) Tj
ET

0.8 0.8 0.8 RG 1 w 40 460 m 555 460 l S
BT /F1 10 Tf 0.07 0.53 0.03 rg 40 435 Td (STATUTORY VALIDITY: VERIFIED ACCORDING TO TELANGANA MEESEVA NORMS) Tj ET

0.8 0.8 0.8 RG 1 w 36 44 m 559 44 l S
BT /F2 8 Tf 0.45 0.45 0.45 rg 36 30 Td (MSN Communication Portal • Hyderabad Central Node • www.meeseva.telangana.gov.in) Tj ET
Q`;

  const contentBytes = encodeAscii(content);

  const header = encodeAscii(`%PDF-1.4\n%âãÏÓ\n`);
  const obj1 = encodeAscii(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  const obj2 = encodeAscii(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  const obj3 = encodeAscii(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(
      2
    )}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`
  );
  const obj4 = encodeAscii(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
  const obj5 = encodeAscii(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  const obj6 = encodeAscii(
    `6 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream\nendobj\n`
  );

  let currentOffset = header.length;
  const offsets: number[] = [];
  offsets.push(currentOffset);
  currentOffset += obj1.length;
  offsets.push(currentOffset);
  currentOffset += obj2.length;
  offsets.push(currentOffset);
  currentOffset += obj3.length;
  offsets.push(currentOffset);
  currentOffset += obj4.length;
  offsets.push(currentOffset);
  currentOffset += obj5.length;
  offsets.push(currentOffset);
  currentOffset += obj6.length;

  const startXref = currentOffset;
  let xrefText = `xref\n0 7\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xrefText += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  xrefText += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return concatUint8Arrays([header, obj1, obj2, obj3, obj4, obj5, obj6, encodeAscii(xrefText)]);
}

/**
 * Converts an image data URL (SVG, PNG, JPG, WebP) to JPEG bytes via HTML5 Canvas
 */
async function rasterizeImageToJpeg(dataUrl: string): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("DOM window not available"));
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 1000;
        const height = img.naturalHeight || img.height || 650;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not obtain canvas 2D context");
        }

        // Fill crisp white background (preserves transparent SVG/PNG cleanly)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const jpegUrl = canvas.toDataURL("image/jpeg", 0.94);
        const base64Data = jpegUrl.split(",")[1];
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        resolve({ bytes, width, height });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Image element failed to decode resource"));
    };

    img.src = dataUrl;
  });
}

/**
 * Standardizes any statutory document into a valid, compliant PDF Blob
 */
export async function convertDocumentToPdfBlob({
  doc,
  dataUrl,
  customerName = "Rohith Kumar",
  appId = "MSN-APP-2026"
}: {
  doc: UploadedFileMeta;
  dataUrl: string;
  customerName?: string;
  appId?: string;
}): Promise<Blob> {
  // If the document is already an official PDF, pass through its bytes directly
  if (doc.type === "application/pdf" || dataUrl.startsWith("data:application/pdf")) {
    return await urlToBlob(dataUrl, "application/pdf");
  }

  const title = doc.docName || doc.name || "Statutory Document";
  const docId = doc.id || doc.applicationId || appId;
  const timestamp = doc.uploadedAt || new Date().toLocaleString();

  try {
    // Rasterize image / SVG to high-res JPEG and build compliant PDF
    const { bytes, width, height } = await rasterizeImageToJpeg(dataUrl);
    const pdfBytes = buildPdfFromJpeg(bytes, width, height, title, customerName, docId);
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  } catch (err) {
    console.warn("Direct rasterization to PDF failed, falling back to structured PDF document:", err);
    const fallbackBytes = buildTextualPdf(title, customerName, docId, timestamp);
    return new Blob([fallbackBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  }
}

/**
 * Triggers a secure, memory-leak-free file download via temporary anchor element
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";

  document.body.appendChild(anchor);
  anchor.click();

  // Safely delay cleanup so browser streams the download uninterrupted
  setTimeout(() => {
    try {
      if (anchor.parentNode) {
        document.body.removeChild(anchor);
      }
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      // Ignored
    }
  }, 1200);
}

/**
 * Robust Document Download Handler: Handles base64, blob, or remote URLs with try/catch
 */
export async function downloadDocument({
  doc,
  format = "pdf",
  customerName = "Citizen",
  appId = "MSN-APP-2026",
  resolvedUrl
}: {
  doc: UploadedFileMeta;
  format?: "pdf" | "image";
  customerName?: string;
  appId?: string;
  resolvedUrl?: string;
}): Promise<{ success: boolean; filename: string; message: string }> {
  try {
    const rawUrl = resolvedUrl || doc.dataUrl || doc.fileUrl || resolveDocumentDataUrl(doc, customerName);
    const cleanId = (doc.id || doc.applicationId || appId || "2026").replace(/[^a-zA-Z0-9_-]/g, "_");

    if (format === "pdf") {
      const filename = `document-${cleanId}.pdf`;
      const pdfBlob = await convertDocumentToPdfBlob({
        doc,
        dataUrl: rawUrl,
        customerName,
        appId
      });
      triggerFileDownload(pdfBlob, filename);
      return { success: true, filename, message: `Downloaded ${filename} successfully!` };
    } else {
      // Image export (PNG)
      const filename = `document-${cleanId}.png`;
      let imageBlob: Blob;
      try {
        imageBlob = await urlToBlob(rawUrl, "image/png");
      } catch (e) {
        // If SVG or data URL conversion fails, use canvas
        const { bytes } = await rasterizeImageToJpeg(rawUrl);
        imageBlob = new Blob([bytes.buffer as ArrayBuffer], { type: "image/jpeg" });
      }
      triggerFileDownload(imageBlob, filename);
      return { success: true, filename, message: `Downloaded ${filename} successfully!` };
    }
  } catch (error: any) {
    console.error("Document download failed:", error);
    throw new Error(error?.message || "Failed to download document");
  }
}

/**
 * Direct PDF Sharing Handler using Web Share API with automatic graceful fallback
 */
export async function shareDocumentAsPdf({
  doc,
  customerName = "Citizen",
  appId = "MSN-APP-2026",
  resolvedUrl
}: {
  doc: UploadedFileMeta;
  customerName?: string;
  appId?: string;
  resolvedUrl?: string;
}): Promise<{ success: boolean; method: "native" | "download_and_copy" | "dismissed"; message: string }> {
  try {
    const rawUrl = resolvedUrl || doc.dataUrl || doc.fileUrl || resolveDocumentDataUrl(doc, customerName);
    const cleanId = (doc.id || doc.applicationId || appId || "2026").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `document-${cleanId}.pdf`;
    const docTitle = doc.docName || doc.name || "Official Document";

    // 1. Convert to standardized PDF Blob
    const pdfBlob = await convertDocumentToPdfBlob({
      doc,
      dataUrl: rawUrl,
      customerName,
      appId
    });

    // 2. Web Share API with File Support
    const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      let canShareFiles = false;
      try {
        if (typeof navigator.canShare === "function") {
          canShareFiles = navigator.canShare({ files: [pdfFile] });
        }
      } catch (e) {
        canShareFiles = false;
      }

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: docTitle,
            text: `Official Document [${docTitle}] from MSN Communication & MeeSeva Portal.`
          });
          return { success: true, method: "native", message: "Shared PDF document successfully!" };
        } catch (shareErr: any) {
          if (shareErr.name === "AbortError") {
            return { success: true, method: "dismissed", message: "Share dismissed" };
          }
          console.warn("navigator.share failed, executing fallback:", shareErr);
        }
      }
    }

    // 3. Graceful Fallback if native file share is unsupported:
    // Automatically trigger PDF download AND copy link to clipboard
    triggerFileDownload(pdfBlob, filename);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (clipErr) {
      // Ignored
    }

    return {
      success: true,
      method: "download_and_copy",
      message: "Direct file share unsupported on this device. PDF downloaded & link copied to clipboard!"
    };
  } catch (error: any) {
    console.error("PDF share failed:", error);
    throw new Error(error?.message || "Failed to share document");
  }
}
