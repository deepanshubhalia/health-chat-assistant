"use client"

import { useState, useRef, useEffect } from 'react';
import { Loader2, FileText, AlertTriangle, Pill, FlaskConical, UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF.js worker setup effect
  useEffect(() => {
    const setupPdfWorker = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        // This is a dynamic import, so we check for window
        if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
        }
      } catch (e) {
        console.error("Failed to load pdf.js worker:", e);
        setError("A core component for PDF processing failed to load. Please refresh the page.");
      }
    };
    setupPdfWorker();
  }, []);


  const extractTextFromFile = async (fileToProcess: File): Promise<string> => {
    if (fileToProcess.type === 'application/pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                try {
                    if (!event.target?.result) return reject('Failed to read file.');
                    const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map((item: any) => item.str).join(' ') + '\n';
                    }
                    resolve(text);
                } catch (e) {
                    console.error("PDF Parsing Error:", e);
                    reject('Failed to parse the PDF file. It might be corrupted or password-protected.');
                }
            };
            reader.onerror = () => reject('Failed to read file.');
            reader.readAsArrayBuffer(fileToProcess);
        });
    } else if (fileToProcess.type.startsWith('image/')) {
        try {
            const Tesseract = await import('tesseract.js');
            const { data: { text } } = await Tesseract.recognize(fileToProcess, 'eng', {
                logger: m => console.log(m) // Optional: log progress
            });
            return text;
        } catch (e) {
            console.error("OCR Error:", e);
            reject('Failed to extract text from the image. The image might be too blurry or in an unsupported format.');
        }
    }

    throw new Error('Unsupported file type. Please upload a PDF or an image.');
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const text = await extractTextFromFile(file);

      if (!text.trim()) {
        throw new Error('Could not extract any text from the file. It might be empty or scanned as an image.');
      }

      const res = await fetch('/api/analyzeReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'The analysis server failed.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Frontend error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
        // 50MB size limit
        if (selectedFile.size > 50 * 1024 * 1024) { 
            setError("File is too large. Please upload a file smaller than 50MB.");
            return;
        }
        setFile(selectedFile);
        setResult(null);
        setError(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow for dropping
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const removeFile = () => {
      setFile(null);
      setResult(null);
      setError(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-blue-200 py-8 px-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-10 flex flex-col"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-2">Upload Your Report</h1>
          <p className="text-gray-500">Get instant AI insights from your medical PDF or image.</p>
        </div>

        <div
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50/80' : 'border-gray-300 bg-white/60 hover:bg-blue-50/60'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!file ? triggerFileSelect : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          {file ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center w-full"
            >
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-gray-700">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              <button
                onClick={removeFile}
                className="mt-4 text-sm text-red-500 hover:text-red-700 font-semibold flex items-center justify-center mx-auto transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Remove File
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full"
            >
              <UploadCloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600">Drag & Drop or <span className="text-blue-600 underline">Browse</span></p>
              <p className="text-sm text-gray-500 mt-1">Maximum file size: 50MB</p>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleAnalyze}
          disabled={loading || !file}
          whileHover={!loading && file ? { scale: 1.03 } : {}}
          whileTap={!loading && file ? { scale: 0.97 } : {}}
          className="w-full mt-8 px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {loading ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <motion.span
                className="inline-block mr-2"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.span>
              Analyzing Report...
            </motion.span>
          ) : 'Analyze Report'}
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow"
              role="alert"
            >
              <p className="font-bold">Analysis Failed</p>
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-10 bg-white/90 rounded-2xl shadow-xl p-6 border border-blue-100"
            >
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-200 to-green-200 mr-3 shadow">
                  🧠
                </span>
                <h2 className="text-xl font-bold text-blue-700">AI Summary</h2>
              </div>
              <p className="text-gray-700 leading-relaxed bg-white/80 p-4 rounded-md shadow-inner">{result.summary || "No summary could be generated."}</p>
              <p className="mt-4 text-xs text-gray-500 text-center italic">Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 