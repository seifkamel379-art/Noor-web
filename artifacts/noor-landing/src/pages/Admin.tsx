import { useState, useEffect } from "react";
import { getApkUrl, setApkUrl } from "@/lib/firebase";
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
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    getApkUrl()
      .then((url) => { setCurrentUrl(url); setNewUrl(url); })
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUrl.trim();
    if (!trimmed) {
      setMsg({ type: "error", text: "الرابط لا يمكن أن يكون فارغاً" });
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setMsg({ type: "error", text: "الرابط غير صالح — تحقق منه وحاول مرة أخرى" });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await setApkUrl(trimmed);
      setCurrentUrl(trimmed);
      setMsg({ type: "success", text: "✅ تم تحديث رابط الـ APK بنجاح!" });
    } catch {
      setMsg({ type: "error", text: "❌ فشل الحفظ — تحقق من الاتصال بالإنترنت" });
    } finally {
      setSaving(false);
    }
  };

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
            تغيير رابط تحميل تطبيق نور (APK)
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
                autoComplete="current-password"
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
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg flex flex-col gap-5">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">جارٍ التحميل...</div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* Current URL */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    الرابط الحالي
                  </p>
                  <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm font-mono break-all text-foreground/70 border border-border">
                    {currentUrl || "لا يوجد رابط محفوظ"}
                  </div>
                </div>

                {/* How to get Google Drive link */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground/80 flex flex-col gap-1">
                  <p className="font-bold text-primary mb-1">📌 كيف تحصل على رابط Google Drive؟</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>ارفع ملف الـ APK على Google Drive</li>
                    <li>كليك يمين على الملف ← <strong>مشاركة</strong> ← <strong>أي شخص لديه الرابط</strong></li>
                    <li>انسخ الرابط والصقه هنا</li>
                  </ol>
                </div>

                {/* New URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    الرابط الجديد
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => { setNewUrl(e.target.value); setMsg(null); }}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    dir="ltr"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

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
                    disabled={saving || newUrl.trim() === currentUrl || !newUrl.trim()}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ الرابط"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    disabled={saving}
                    className="px-5 py-3 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors"
                  >
                    رجوع
                  </button>
                </div>
              </form>
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
