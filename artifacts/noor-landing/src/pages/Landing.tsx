import { useState, useEffect, useRef } from "react";
import { Star, Download, Moon, Sun, BookOpen, Clock, Compass, Radio, Hash, Heart, Circle, ChevronLeft, ChevronRight, Pencil, Trash2, X, Check } from "lucide-react";
import {
  type Review,
  fetchReviews,
  submitReview,
  updateReview,
  deleteReview,
  getDownloadCount,
  incrementDownloadCount,
} from "@/lib/firebase";

const TOKENS_KEY = "noor-review-tokens";

function getStoredTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveToken(id: string, token: string) {
  const tokens = getStoredTokens();
  tokens[id] = token;
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

function removeToken(id: string) {
  const tokens = getStoredTokens();
  delete tokens[id];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

// Dark mode screenshots
const DARK_SCREENS = [
  "/screenshots/page-01.jpg",   // الصورة الرئيسية
  "/screenshots/page-02.jpg",   // المتتبع اليومي
  "/screenshots/page-24.jpg",   // القرآن الكريم
  "/screenshots/page-03.jpg",   // سورة الفاتحة
  "/screenshots/page-04.jpg",   // الأذكار
  "/screenshots/page-05.jpg",   // السبحة
  "/screenshots/page-25.jpg",   // العداد العالمي
  "/screenshots/page-11.jpg",   // صفحة المزيد
  "/screenshots/page-06.jpg",   // تحديد القبلة
  "/screenshots/page-07.jpg",   // الإذاعات الإسلامية
  "/screenshots/page-08.jpg",   // أسماء الله الحسنى
  "/screenshots/page-09.jpg",   // القراء
  "/screenshots/page-10.jpg",   // التدبر الذكي
];

// Light mode screenshots
const LIGHT_SCREENS = [
  "/screenshots/page-12.jpg",   // الصورة الرئيسية
  "/screenshots/page-23.jpg",   // المتتبع اليومي
  "/screenshots/page-13.jpg",   // القرآن الكريم
  "/screenshots/page-14.jpg",   // سورة الفاتحة
  "/screenshots/page-15.jpg",   // الأذكار
  "/screenshots/page-16.jpg",   // السبحة
  "/screenshots/page-26.jpg",   // العداد العالمي
  "/screenshots/page-17.jpg",   // صفحة المزيد
  "/screenshots/page-18.jpg",   // تحديد القبلة
  "/screenshots/page-19.jpg",   // الإذاعات الإسلامية
  "/screenshots/page-20.jpg",   // أسماء الله الحسنى
  "/screenshots/page-21.jpg",   // القراء
  "/screenshots/page-22.jpg",   // التدبر الذكي
];

const SCREEN_LABELS = [
  "الصورة الرئيسية",
  "المتتبع اليومي",
  "القرآن الكريم",
  "سورة الفاتحة",
  "الأذكار",
  "السبحة",
  "العداد العالمي",
  "صفحة المزيد",
  "تحديد القبلة",
  "الإذاعات الإسلامية",
  "أسماء الله الحسنى",
  "القراء",
  "التدبر الذكي",
];

function StarRating({ rating, onChange, interactive = false }: { rating: number; onChange?: (r: number) => void; interactive?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" style={{ direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => interactive && onChange && onChange(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          disabled={!interactive}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= (hovered || rating) ? "text-yellow-500 fill-yellow-500" : "text-border fill-none"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-card-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PhoneMockup({ dark }: { dark: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screens = dark ? DARK_SCREENS : LIGHT_SCREENS;

  const goTo = (idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setVisible(true);
    }, 300);
  };

  useEffect(() => {
    setCurrentIndex(0);
    setVisible(true);
  }, [dark]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % screens.length);
        setVisible(true);
      }, 300);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [dark, screens.length]);

  const prev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo((currentIndex - 1 + screens.length) % screens.length);
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(p => (p + 1) % screens.length);
        setVisible(true);
      }, 300);
    }, 5000);
  };

  const next = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo((currentIndex + 1) % screens.length);
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(p => (p + 1) % screens.length);
        setVisible(true);
      }, 300);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center gap-3">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm"
          aria-label="الصورة السابقة"
        >
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 rounded-[44px] bg-primary/20 blur-2xl scale-95 pointer-events-none" />
          <div
            className="relative w-[230px] h-[470px] rounded-[40px] overflow-hidden"
            style={{
              border: "7px solid",
              borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
              boxShadow: dark
                ? "inset 0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5)"
                : "inset 0 0 0 1px rgba(0,0,0,0.08), 0 30px 60px rgba(139,90,43,0.28)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2"
              style={{ background: dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)" }}
            >
              <div className="w-16 h-3 rounded-full bg-black/20" />
            </div>

            <img
              key={`${dark ? "d" : "l"}-${currentIndex}`}
              src={screens[currentIndex]}
              alt={SCREEN_LABELS[currentIndex] || "شاشة التطبيق"}
              className="w-full h-full object-cover object-top transition-opacity duration-300"
              style={{ opacity: visible ? 1 : 0 }}
            />

            <div
              className="absolute bottom-0 left-0 right-0 z-10 py-2 px-3 flex items-center justify-center"
              style={{
                background: dark
                  ? "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                  : "linear-gradient(to top, rgba(255,248,235,0.85), transparent)",
              }}
            >
              <span className={`text-xs font-semibold ${dark ? "text-yellow-300" : "text-amber-700"}`}>
                {SCREEN_LABELS[currentIndex % SCREEN_LABELS.length]}
              </span>
            </div>
          </div>
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
            style={{ backgroundColor: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
          />
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm"
          aria-label="الصورة التالية"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
        {screens.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all rounded-full"
            style={{
              width: i === currentIndex ? "20px" : "6px",
              height: "6px",
              backgroundColor: i === currentIndex
                ? "hsl(var(--primary))"
                : "hsl(var(--border))",
            }}
            aria-label={`الصورة ${i + 1}`}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {currentIndex + 1} / {screens.length}
      </p>
    </div>
  );
}

function EditModal({
  review,
  onSave,
  onClose,
}: {
  review: Review;
  onSave: (updated: Review) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(review.name);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("من فضلك أدخل اسمك"); return; }
    const token = getStoredTokens()[review.id];
    if (!token) { setError("لا تملك صلاحية التعديل"); return; }
    setSaving(true);
    setError("");
    try {
      const updated = await updateReview(review.id, token, { name: name.trim(), rating, comment: comment.trim() });
      onSave(updated);
    } catch {
      setError("حدث خطأ أثناء التعديل، حاول مجدداً");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">تعديل التقييم</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">الاسم *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">التقييم *</label>
            <StarRating rating={rating} onChange={setRating} interactive />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">الملاحظة</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ التعديل"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-card-border hover:bg-secondary transition-colors font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  ownToken,
  onUpdated,
  onDeleted,
}: {
  review: Review;
  ownToken: string | undefined;
  onUpdated: (updated: Review) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!ownToken) return;
    setDeleting(true);
    try {
      await deleteReview(review.id, ownToken);
      removeToken(review.id);
      onDeleted(review.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-colors relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-bold text-foreground">{review.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(review.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            {ownToken && (
              <div className="flex gap-1 mr-1">
                <button
                  onClick={() => setEditing(true)}
                  className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  title="تعديل التقييم"
                >
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  title="حذف التقييم"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            )}
          </div>
        </div>
        {review.comment && (
          <p className="text-foreground/80 text-sm leading-relaxed">{review.comment}</p>
        )}

        {confirmDelete && (
          <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
            <p className="font-semibold text-center">هل أنت متأكد من حذف تقييمك؟</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60"
              >
                {deleting ? "جارٍ الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-5 py-2 rounded-xl border border-card-border hover:bg-secondary transition-colors font-semibold text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <EditModal
          review={review}
          onSave={(updated) => { onUpdated(updated); setEditing(false); }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

export default function Landing() {
  const [dark, setDark] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  const [downloadCount, setDownloadCount] = useState(0);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("noor-dark");
    if (saved === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
    setMyTokens(getStoredTokens());
  }, []);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, []);

  useEffect(() => {
    getDownloadCount()
      .then(setDownloadCount)
      .catch(console.error);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("noor-dark", String(next));
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleDownload = () => {
    incrementDownloadCount()
      .then(() => setDownloadCount(c => c + 1))
      .catch((err) => {
        console.error("Download counter error:", err?.code, err?.message);
      });
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setSubmitError("من فضلك أدخل اسمك"); return; }
    if (!formRating) { setSubmitError("من فضلك اختر تقييمك"); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      const review = await submitReview({ name: formName.trim(), rating: formRating, comment: formComment.trim() });
      saveToken(review.id, review.token);
      setMyTokens(getStoredTokens());
      setReviews(prev => [review, ...prev]);
      setFormName("");
      setFormRating(5);
      setFormComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setSubmitError("حدث خطأ أثناء الإرسال، حاول مجدداً");
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: BookOpen, title: "القرآن الكريم", description: "تلاوات بأصوات أكثر من 50 قارئاً مع قارئ التدبر الذكي وتفسير الجلالين" },
    { icon: Clock, title: "مواقيت الصلاة", description: "مواقيت صلاة دقيقة بحسب موقعك الجغرافي مع أذان لكل صلاة" },
    { icon: Heart, title: "الأذكار والأدعية", description: "أذكار الصباح والمساء وأدعية يومية منتقاة من السنة النبوية الشريفة" },
    { icon: Circle, title: "السبحة الإلكترونية", description: "سبحة ذكية تحسب الجولات تلقائياً مع أصوات خشوع هادئة" },
    { icon: Compass, title: "اتجاه القبلة", description: "تحديد اتجاه القبلة بدقة عالية باستخدام البوصلة والخرائط" },
    { icon: Hash, title: "أسماء الله الحسنى", description: "الأسماء الحسنى التسعة والتسعون مع شرح معنى كل اسم" },
    { icon: Radio, title: "إذاعات إسلامية", description: "مجموعة متنوعة من الإذاعات الإسلامية للقرآن والمحاضرات" },
    { icon: Moon, title: "الوضع الليلي", description: "دعم كامل للوضع المظلم لراحة العين أثناء القراءة الليلية" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/noor-logo.png" alt="نور" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-bold text-xl text-primary" style={{ fontFamily: "'Cairo', sans-serif" }}>تطبيق نور</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/noor-app.apk"
              download="noor-app.apk"
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-shimmer hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              تحميل التطبيق
            </a>
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="تبديل الوضع"
            >
              {dark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16 islamic-pattern">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-110" />
            <img
              src="/noor-logo.png"
              alt="شعار نور"
              className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover shadow-xl"
            />
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <span className="gold-text">تطبيق نور</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-foreground/80">
              رفيقك الإسلامي الشامل
            </h2>
          </div>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
            صُمِّم لمساعدة المسلمين على تعزيز صلتهم بالله وإحياء سنة النبي ﷺ في حياتهم اليومية. قرآن، صلاة، أذكار، وأكثر — كل ما تحتاجه في تطبيق واحد.
          </p>

          <PhoneMockup dark={dark} />

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <a
              href="/noor-app.apk"
              download="noor-app.apk"
              type="application/vnd.android.package-archive"
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold btn-shimmer hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              تحميل التطبيق الآن (APK)
            </a>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-primary/40 text-primary text-lg font-semibold hover:bg-primary/10 transition-all"
            >
              اكتشف المميزات
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">+50</div>
              <div className="text-xs text-muted-foreground">قارئاً للقرآن</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary">99</div>
              <div className="text-xs text-muted-foreground">اسم من أسماء الله</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{downloadCount > 0 ? `+${downloadCount}` : "0"}</div>
              <div className="text-xs text-muted-foreground">تحميل</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{reviews.length > 0 ? `+${reviews.length}` : "0"}</div>
              <div className="text-xs text-muted-foreground">تقييم مستخدم</div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-6xl mx-auto px-4 py-2 ornament-divider">
        <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">مميزات التطبيق</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
              كل ما يحتاجه المسلم
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              مجموعة شاملة من الأدوات الإسلامية المصممة لتكون رفيقك اليومي في طريق الاستقامة
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-6xl mx-auto px-4 py-2 ornament-divider">
        <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">آراء المستخدمين</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
              ماذا يقول مستخدمونا؟
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-4xl font-black text-primary">{avgRating}</span>
                <div>
                  <StarRating rating={Math.round(parseFloat(avgRating))} />
                  <p className="text-xs text-muted-foreground mt-1">{reviews.length} تقييم</p>
                </div>
              </div>
            )}
          </div>

          {loadingReviews ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ تحميل التقييمات...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 text-border" />
              <p>كن أول من يُقيّم التطبيق!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {reviews.slice(0, 6).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  ownToken={myTokens[review.id]}
                  onUpdated={(updated) => setReviews(prev => prev.map(r => r.id === updated.id ? updated : r))}
                  onDeleted={(id) => setReviews(prev => prev.filter(r => r.id !== id))}
                />
              ))}
            </div>
          )}

          {/* Review Form */}
          <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-center">أضف تقييمك</h3>
            {submitted && (
              <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-center font-semibold">
                شكراً لك! تم إرسال تقييمك بنجاح.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">الاسم *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="اكتب اسمك هنا"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">التقييم *</label>
                <StarRating rating={formRating} onChange={setFormRating} interactive />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  ملاحظتك <span className="text-muted-foreground font-normal">(اختياري)</span>
                </label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="شاركنا رأيك في التطبيق..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                />
              </div>
              {submitError && <p className="text-destructive text-sm">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed btn-shimmer"
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/noor-logo.png" alt="نور" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-lg text-primary">تطبيق نور</span>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            رفيقك الإسلامي الشامل • القرآن • الصلاة • الأذكار
          </p>

          <div className="flex justify-center mb-6">
            <div className="px-10 py-6 rounded-2xl border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors shadow-md">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Made with care</p>
              <p className="text-2xl font-black text-foreground">
                Designed &amp; Developed by{" "}
                <span className="gold-text">Seif Kamel</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} تطبيق نور. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
