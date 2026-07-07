import { useState, useEffect, useRef } from "react";
import { getApkUrl, setApkUrl, uploadApkFile } from "@/lib/firebase";
import { useLocation } from "wouter";

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN as string | undefined;

export default function Admin() {
  const [, navigate] = useLocation();

  // PIN gate
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // APK state
  const [currentUrl, setCurrentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    getApkUrl()
      .then((url) => setCurrentUrl(url))
      .catch(() => setCurrentUrl("/noor-app.apk"))
      .finally(() => setLoading(false));
  }, [unlocked]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_PIN) {
      setPinError("لم يتم تهيئة كلمة المرور. أضف VITE_ADMIN_PIN في إعدادات المشروع.");
      return;
    }
    if (pinInput === ADMIN_PIN) {
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("❌ كلمة المرور غلط");
      setPinInput("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMsg(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setMsg(null);

    try {
      const downloadURL = await uploadApkFile(selectedFile, (percent) => {
        setUploadProgress(percent);
      });
      await setApkUrl(downloadURL);
      setCurrentUrl(downloadURL);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMsg({ type: "success", text: "✅ تم رفع الـ APK وتحديث الرابط بنجاح!" });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "❌ فشل الرفع — تأكد من إعدادات Firebase Storage وحاول مجدداً" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const fileSizeMB = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(1) : null;

  return (
    <div
      className="min-h-screen bg-background text-foreground flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <img src="/noor-logo.png" alt="نور" className="w-10 h-10 rounded-xl object-cover" />
          </div>
          <h1
            className="text-2xl font-black text-primary"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            لوحة تحكم المسؤول
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            رفع نسخة جديدة من تطبيق نور (APK)
          </p>
        </div>

        {/* PIN Gate */}
        {!unlocked ? (
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg">
            <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
              <label className="block text-sm font-semibold text-center text-foreground">
                🔐 أدخل كلمة المرور للمتابعة
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                autoFocus
              />
              {pinError && (
                <p className="text-center text-sm font-bold text-red-500">{pinError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                دخول
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg flex flex-col gap-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">جارٍ التحميل...</div>
            ) : (
              <>
                {/* Current APK */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    النسخة الحالية
                  </p>
                  <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm font-mono break-all text-foreground/70 border border-border">
                    {currentUrl || "لا يوجد رابط محفوظ"}
                  </div>
                </div>

                {/* Upload form */}
                <form onSubmit={handleUpload} className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    رفع نسخة جديدة
                  </p>

                  {/* Drop zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                      selectedFile
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-secondary/30"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📦</span>
                        <p className="font-bold text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{fileSizeMB} MB</p>
                        <p className="text-xs text-primary font-medium">اضغط لتغيير الملف</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📂</span>
                        <p className="font-semibold text-foreground">اضغط لاختيار ملف APK</p>
                        <p className="text-sm text-muted-foreground">ملفات .apk فقط</p>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {uploading && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>جارٍ الرفع...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {msg && (
                    <div
                      className={`rounded-xl px-4 py-3 text-sm font-bold text-center ${
                        msg.type === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!selectedFile || uploading}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {uploading ? `جارٍ الرفع ${uploadProgress}%` : "رفع الـ APK"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      disabled={uploading}
                      className="px-5 py-3 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-40"
                    >
                      رجوع
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4 opacity-50">
          هذه الصفحة مخفية — لا تشاركها مع أحد
        </p>
      </div>
    </div>
  );
}
