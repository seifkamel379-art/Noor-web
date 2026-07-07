import { useState, useEffect } from "react";
import { getApkUrl, setApkUrl } from "@/lib/firebase";
import { useLocation } from "wouter";

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN as string | undefined;

export default function Admin() {
  const [, navigate] = useLocation();

  // PIN gate state
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // APK form state
  const [currentUrl, setCurrentUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load APK URL only after unlocking
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
    // Validate: must be a valid https URL
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        setMsg({ type: "error", text: "الرابط يجب أن يبدأ بـ https://" });
        return;
      }
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
          /* APK Management Card */
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">جارٍ التحميل...</div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                {/* Current URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    الرابط الحالي
                  </label>
                  <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm font-mono break-all text-foreground/70 border border-border">
                    {currentUrl}
                  </div>
                </div>

                {/* New URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                    الرابط الجديد
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/noor-app.apk"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    dir="ltr"
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    أدخل رابطاً مباشراً للـ APK (Google Drive، Telegram، أي رابط مباشر)
                  </p>
                </div>

                {/* Feedback message */}
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
                    disabled={saving || newUrl.trim() === currentUrl}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ الرابط"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
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
