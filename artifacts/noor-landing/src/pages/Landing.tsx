import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Star, Download, Moon, Sun, BookOpen, Clock, Compass, Radio, Hash, Heart, Circle,
  ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, Tv, Scroll, Landmark, Users,
  GraduationCap, BookMarked, WifiOff, Shield, Package, Zap, BadgeCheck, Lock,
} from "lucide-react";
import {
  type Review,
  fetchReviews,
  submitReview,
  updateReview,
  deleteReview,
  getDownloadCount,
  incrementDownloadCount,
  getApkUrl,
} from "@/lib/firebase";

/* ── Token helpers ── */
const TOKENS_KEY = "noor-review-tokens";
function getStoredTokens(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}"); } catch { return {}; }
}
function saveToken(id: string, token: string) {
  const t = getStoredTokens(); t[id] = token; localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
}
function removeToken(id: string) {
  const t = getStoredTokens(); delete t[id]; localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
}

/* ── Animation helpers ── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}>
      {children}
    </motion.div>
  );
}
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay }}>
      {children}
    </motion.div>
  );
}
function StaggerGrid({ children, className = "" }: { children: React.ReactNode[]; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={inView ? "show" : "hidden"}
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
      {children}
    </motion.div>
  );
}
const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
};

/* ── Count-up animation ── */
function CountUp({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / steps, 3);
      current = Math.round(target * ease);
      setCount(current);
      if (frame >= steps) { setCount(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Ornament divider ── */
function SectionOrnament() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
      <div className="flex gap-1.5 items-center">
        <div className="w-1.5 h-1.5 rotate-45 bg-primary/40" />
        <div className="w-2.5 h-2.5 rotate-45 bg-primary/70" />
        <div className="w-1.5 h-1.5 rotate-45 bg-primary/40" />
      </div>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
    </div>
  );
}

/* ── Review avatar ── */
const AVATAR_COLORS = [
  "bg-amber-500","bg-orange-500","bg-yellow-600","bg-red-500",
  "bg-emerald-600","bg-teal-500","bg-blue-500","bg-purple-600",
  "bg-pink-500","bg-indigo-500",
];
function ReviewAvatar({ name }: { name: string }) {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return (
    <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[idx]} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm`}>
      {name.charAt(0)}
    </div>
  );
}

/* ── Screen data ── */
const DARK_SCREENS = [
  "/screenshots/page-01.webp","/screenshots/page-02.webp","/screenshots/page-24.webp",
  "/screenshots/page-03.webp","/screenshots/page-04.webp","/screenshots/page-05.webp",
  "/screenshots/page-25-stats.webp","/screenshots/page-11.webp","/screenshots/page-06.webp",
  "/screenshots/page-07.webp","/screenshots/page-08.webp","/screenshots/page-09.webp",
  "/screenshots/page-10.webp","/screenshots/page-27.webp","/screenshots/page-29.webp",
  "/screenshots/page-31.webp","/screenshots/page-33.webp","/screenshots/page-35.webp",
  "/screenshots/page-37.webp",
];
const LIGHT_SCREENS = [
  "/screenshots/page-12.webp","/screenshots/page-23.webp","/screenshots/page-13.webp",
  "/screenshots/page-14.webp","/screenshots/page-15.webp","/screenshots/page-16.webp",
  "/screenshots/page-26-stats.webp","/screenshots/page-17.webp","/screenshots/page-18.webp",
  "/screenshots/page-19.webp","/screenshots/page-20.webp","/screenshots/page-21.webp",
  "/screenshots/page-22.webp","/screenshots/page-28.webp","/screenshots/page-30.webp",
  "/screenshots/page-32.webp","/screenshots/page-34.webp","/screenshots/page-36.webp",
  "/screenshots/page-38.webp",
];
const SCREEN_LABELS = [
  "الصورة الرئيسية","المتتبع اليومي","القرآن الكريم","سورة الفاتحة",
  "الأذكار","السبحة","إحصائياتك","صفحة المزيد","تحديد القبلة",
  "الإذاعات الإسلامية","أسماء الله الحسنى","القراء","التدبر الذكي",
  "الأحاديث الشريفة","التاريخ الإسلامي","قصص الأنبياء","سنن النبي",
  "الاختبارات الإسلامية","القنوات الإسلامية",
];

/* ── StarRating ── */
function StarRating({ rating, onChange, interactive = false, size = "md" }: {
  rating: number; onChange?: (r: number) => void; interactive?: boolean; size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "التقييم" : undefined} style={{ direction: "ltr" }}>
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          aria-label={`${s} ${s === 1 ? "نجمة" : "نجوم"}`}
          aria-pressed={interactive ? s === rating : undefined}
          onClick={() => interactive && onChange && onChange(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          disabled={!interactive}>
          <Star className={`${sz} transition-colors ${s <= (hovered || rating) ? "text-yellow-500 fill-yellow-500" : "text-border fill-none"}`} />
        </button>
      ))}
    </div>
  );
}

/* ── FeatureCard ── */
function FeatureCard({ icon: Icon, title, description, bullets }: {
  icon: React.ElementType; title: string; description: string; bullets?: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={cardVariant}
      className="group flex items-start gap-4 p-4 rounded-2xl bg-card border border-card-border
        hover:border-primary/50 transition-all duration-300
        hover:shadow-[0_8px_32px_-4px_hsl(var(--primary)/0.18)] hover:-translate-y-1 cursor-default">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5
        group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-foreground leading-snug">{title}</h3>
          {bullets && bullets.length > 0 && (
            <button onClick={() => setOpen(o => !o)}
              className="shrink-0 text-primary/60 hover:text-primary transition-colors text-xs font-bold leading-none"
              title={open ? "إخفاء التفاصيل" : "عرض التفاصيل"}>
              {open ? "▲" : "▼"}
            </button>
          )}
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed mt-1">{description}</p>
        <AnimatePresence>
          {open && bullets && bullets.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-2 space-y-1 border-t border-border/40 pt-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/70">
                  <span className="text-primary shrink-0 font-black mt-0.5">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── PhoneMockup ── */
function PhoneMockup({ dark }: { dark: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screens = dark ? DARK_SCREENS : LIGHT_SCREENS;
  const goTo = (idx: number) => { setVisible(false); setTimeout(() => { setCurrentIndex(idx); setVisible(true); }, 300); };
  useEffect(() => { setCurrentIndex(0); setVisible(true); }, [dark]);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setCurrentIndex(p => (p + 1) % screens.length); setVisible(true); }, 300);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [dark, screens.length]);
  const nav = (dir: 1 | -1) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo((currentIndex + dir + screens.length) % screens.length);
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setCurrentIndex(p => (p + 1) % screens.length); setVisible(true); }, 300);
    }, 5000);
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center gap-3">
        <button onClick={() => nav(1)} aria-label="الشاشة السابقة" className="w-9 h-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm"><ChevronRight className="w-4 h-4 text-primary" /></button>
        <div className="relative">
          <div className="absolute inset-0 rounded-[44px] bg-primary/20 blur-2xl scale-95 pointer-events-none" />
          <div className="relative w-[230px] h-[470px] rounded-[40px] overflow-hidden" style={{
            border:"7px solid", borderColor: dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)",
            boxShadow: dark?"inset 0 0 0 1px rgba(255,255,255,0.05),0 30px 60px rgba(0,0,0,0.5)":"inset 0 0 0 1px rgba(0,0,0,0.08),0 30px 60px rgba(139,90,43,0.28)",
          }}>
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2" style={{ background: dark?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.3)" }}>
              <div className="w-16 h-3 rounded-full bg-black/20" />
            </div>
            <img key={`${dark?"d":"l"}-${currentIndex}`} src={screens[currentIndex]} alt={SCREEN_LABELS[currentIndex]||"شاشة"} className="w-full h-full object-cover object-top transition-opacity duration-300" style={{ opacity: visible?1:0 }} />
            <div className="absolute bottom-0 left-0 right-0 z-10 py-2 px-3 flex items-center justify-center" style={{ background: dark?"linear-gradient(to top,rgba(0,0,0,0.8),transparent)":"linear-gradient(to top,rgba(255,248,235,0.85),transparent)" }}>
              <span className={`text-xs font-semibold ${dark?"text-yellow-300":"text-amber-700"}`}>{SCREEN_LABELS[currentIndex%SCREEN_LABELS.length]}</span>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full" style={{ backgroundColor: dark?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)" }} />
        </div>
        <button onClick={() => nav(-1)} aria-label="الشاشة التالية" className="w-9 h-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm"><ChevronLeft className="w-4 h-4 text-primary" /></button>
      </div>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
        {screens.map((_,i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`الانتقال إلى الشاشة ${i+1}`} aria-current={i===currentIndex?"true":undefined} className="transition-all rounded-full" style={{ width:i===currentIndex?"20px":"6px", height:"6px", backgroundColor:i===currentIndex?"hsl(var(--primary))":"hsl(var(--border))" }} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{currentIndex+1} / {screens.length}</p>
    </div>
  );
}

/* ── EditModal ── */
function EditModal({ review, onSave, onClose }: { review: Review; onSave:(u:Review)=>void; onClose:()=>void }) {
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
    setSaving(true); setError("");
    try { const u = await updateReview(review.id, token, { name:name.trim(), rating, comment:comment.trim() }); onSave(u); }
    catch { setError("حدث خطأ أثناء التعديل، حاول مجدداً"); }
    finally { setSaving(false); }
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ background:"rgba(0,0,0,0.6)" }}>
      <motion.div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-md shadow-2xl" dir="rtl"
        initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">تعديل التقييم</h3>
          <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-semibold mb-2">الاسم *</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" required />
          </div>
          <div><label className="block text-sm font-semibold mb-2">التقييم *</label><StarRating rating={rating} onChange={setRating} interactive /></div>
          <div><label className="block text-sm font-semibold mb-2">الملاحظة</label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-60">
              <Check className="w-4 h-4" />{saving?"جارٍ الحفظ...":"حفظ التعديل"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-card-border hover:bg-secondary transition-colors font-semibold">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── ReviewCard ── */
function ReviewCard({ review, ownToken, onUpdated, onDeleted }: {
  review: Review; ownToken:string|undefined; onUpdated:(u:Review)=>void; onDeleted:(id:string)=>void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const TRUNCATE_LEN = 120;
  const isLong = review.comment && review.comment.length > TRUNCATE_LEN;
  const displayComment = isLong && !expanded ? review.comment.slice(0, TRUNCATE_LEN) + "..." : review.comment;

  const handleDelete = async () => {
    if (!ownToken) return; setDeleting(true);
    try { await deleteReview(review.id, ownToken); removeToken(review.id); onDeleted(review.id); }
    catch { setDeleting(false); setConfirmDelete(false); }
  };

  return (
    <>
      <motion.div variants={cardVariant}
        className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-all relative hover:shadow-lg">
        <div className="flex items-start gap-3 mb-3">
          <ReviewAvatar name={review.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-foreground truncate">{review.name}</div>
              {ownToken && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(true)} aria-label="تعديل التقييم" className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5 text-primary" /></button>
                  <button onClick={() => setConfirmDelete(true)} aria-label="حذف التقييم" className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" })}
              </span>
            </div>
          </div>
        </div>
        {review.comment && (
          <div>
            <p className="text-foreground/80 text-sm leading-relaxed">{displayComment}</p>
            {isLong && (
              <button onClick={() => setExpanded(e => !e)} className="text-primary text-xs font-semibold mt-1 hover:underline">
                {expanded ? "أقل ▲" : "اقرأ المزيد ▼"}
              </button>
            )}
          </div>
        )}
        {confirmDelete && (
          <div className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 z-10">
            <p className="font-semibold text-center">هل أنت متأكد من حذف تقييمك؟</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60">{deleting?"جارٍ الحذف...":"نعم، احذف"}</button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="px-5 py-2 rounded-xl border border-card-border hover:bg-secondary transition-colors font-semibold text-sm">إلغاء</button>
            </div>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {editing && <EditModal review={review} onSave={u => { onUpdated(u); setEditing(false); }} onClose={() => setEditing(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════ */
export default function Landing() {
  const [, navigate] = useLocation();
  const [dark, setDark] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadMsg, setDownloadMsg] = useState<"success"|"error"|null>(null);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [apkUrl, setApkUrl] = useState("/noor-app.apk");
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("noor-dark");
    if (saved === "true") { setDark(true); document.documentElement.classList.add("dark"); }
    setMyTokens(getStoredTokens());
  }, []);
  useEffect(() => { fetchReviews().then(setReviews).catch(console.error).finally(() => setLoadingReviews(false)); }, []);
  useEffect(() => { getDownloadCount().then(setDownloadCount).catch(console.error); }, []);
  useEffect(() => { getApkUrl().then(setApkUrl).catch(console.error); }, []);

  /* Scroll tracking */
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = window.scrollY;
      const maxScroll = el.scrollHeight - el.clientHeight;
      setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
      setScrolled(scrollTop > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 10) { logoClickCount.current = 0; navigate("/admin"); return; }
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 3000);
  };
  const toggleDark = () => {
    const next = !dark; setDark(next); localStorage.setItem("noor-dark", String(next));
    if (next) document.documentElement.classList.add("dark"); else document.documentElement.classList.remove("dark");
  };
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = apkUrl;
    incrementDownloadCount()
      .then(() => { setDownloadCount(c => c+1); setDownloadMsg("success"); setTimeout(() => setDownloadMsg(null), 3000); })
      .catch(err => { console.error("[Noor] Download counter error:", err); setDownloadMsg("error"); setTimeout(() => setDownloadMsg(null), 4000); })
      .finally(() => { const a = document.createElement("a"); a.href=url; a.download="noor-app.apk"; document.body.appendChild(a); a.click(); document.body.removeChild(a); });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setSubmitError("من فضلك أدخل اسمك"); return; }
    if (!formRating) { setSubmitError("من فضلك اختر تقييمك"); return; }
    setSubmitError(""); setSubmitting(true);
    try {
      const review = await submitReview({ name:formName.trim(), rating:formRating, comment:formComment.trim() });
      saveToken(review.id, review.token); setMyTokens(getStoredTokens());
      setReviews(prev => [review, ...prev]); setFormName(""); setFormRating(5); setFormComment(""); setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch { setSubmitError("حدث خطأ أثناء الإرسال، حاول مجدداً"); }
    finally { setSubmitting(false); }
  };

  const avgRating = reviews.length ? (reviews.reduce((s,r) => s+r.rating, 0)/reviews.length).toFixed(1) : "0.0";

  const features = [
    { icon:Clock, title:"مواقيت الصلاة", description:"عداد تنازلي بالثانية مع مكتبة فلكية حقيقية، وضبط التقويم الهجري بيدك.", bullets:["٣ إشعارات لكل صلاة: قبل ٢٠ دقيقة، قبل ١٠ دقائق، وعند الأذان","إشعار يومي: آية أو حديث أو ذكر على ساعة تختارها","حارس الصلاة 🛡️ — شاشة كاملة، زر واحد: «أقسم أني صليت»"] },
    { icon:BookOpen, title:"القرآن الكريم", description:"القرآن كاملاً بالرسم العثماني مع ٢٤ قارئاً وبحث ذكي يتجاهل التشكيل.", bullets:["ضغطة طويلة على آية ← تفسير الميسر فوراً","اضغط على أي كلمة ← تُشغَّل صوتياً بالضبط!","مصاحف: تجويد / ورش / شمرلي / حفص — PDF للتنزيل"] },
    { icon:Heart, title:"الأذكار والأدعية", description:"أذكار الصباح والمساء والنوم والأكل والدخول والخروج — من حصن المسلم.", bullets:["عداد اهتزاز مع كل ضغطة","تيك أخضر لما تكمّل الذكر ← ينزل للأسفل","تأكيد قبل التصفير — علشان ميجيش خطأ"] },
    { icon:Circle, title:"السبحة الذكية", description:"سبحة ٣٣ حبة دائرية بتدور وبتضيء، وفي المنتصف عداد الجولات بالذهبي.", bullets:["إحصائيات تفصيلية لكل نوع تسبيح","تأكيد قبل التصفير"] },
    { icon:Scroll, title:"الأحاديث الشريفة", description:"+٣٤,٠٠٠ حديث من الكتب الستة كاملةً — بدون نت.", bullets:["البخاري ٧٥٨٠ • مسلم ٧٣٦٠ • الترمذي ٣٩٢٤","أبو داود ٥٢٧٢ • ابن ماجه ٤٣٣٨ • النسائي ٥٦٧٩","بحث بالكلمات ونسخ الحديث الكامل"] },
    { icon:Landmark, title:"التاريخ الإسلامي", description:"+٤,٩٧٥ حدث تاريخي بتفصيلة كاملة وورقة قابلة للفتح.", bullets:["السيرة ١٤٢ • الراشدون ١١٨ • الأموية ٢١٧","العباسية ١٩٣٢ • الأيوبية ٢٠٧ • المماليك ٨٧٠ • العثمانية ١٤٨٩"] },
    { icon:Users, title:"قصص الأنبياء", description:"كل نبي بقصته كاملة مقسّمة لأحداث وعدد مرات ذكره في القرآن.", bullets:["قصص مفصّلة من آدم حتى محمد ﷺ","﴿لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِّأُولِي الْأَلْبَابِ﴾"] },
    { icon:GraduationCap, title:"الاختبارات الإسلامية", description:"٥,٨٢٠ سؤال في القرآن والحديث والفقه والتاريخ — تتخلط عشوائياً.", bullets:["٣ مستويات صعوبة","اختبار الحفظ: اختيار متعدد أو الكلمة الناقصة","النتيجة محفوظة لكل سورة"] },
    { icon:BookMarked, title:"القراءة السريعة", description:"آيات كلمة كلمة بسرعة تحددها مع حساب الوقت المتبقي للسورة.", bullets:["تحكم كامل: تشغيل / إيقاف / تالية / سابقة","Bookmark لحفظ مكانك"] },
    { icon:Compass, title:"بوصلة القبلة", description:"بوصلة Premium بـ٧٢ علامة درجة — تضيء وتهتز على الاتجاه الصح.", bullets:["دقة عالية مع مؤشر اهتزازي"] },
    { icon:Radio, title:"إذاعة القرآن", description:"إذاعة القرآن الكريم بواجهة راديو خشبي كلاسيكي أنيق.", bullets:["شريط تردد VFD phosphor أخضر كلاسيكي","عدة محطات إسلامية"] },
    { icon:Tv, title:"القنوات الإسلامية", description:"قناة القرآن الكريم + قناة السنة النبوية بث مباشر بدون إعلانات.", bullets:[] },
    { icon:Hash, title:"أسماء الله الحسنى", description:"٩٩ اسماً في شبكة ذهبية — رقم كل اسم في دائرة مع المعنى.", bullets:["بحث بالعربي أو الإنجليزي"] },
    { icon:BookMarked, title:"سنن النبي ﷺ", description:"٥ أقسام: عام ✦ مسجد ✦ أذكار ✦ نوم ✦ سفر — كل سنة بالحديث والأجر.", bullets:["البطاقة قابلة للتوسعة — اضغط تتفتح"] },
    { icon:Users, title:"دليل القراء العالميين", description:"٣ مراحل: قائمة → سور → مشغّل مدمج مع تشغيل متتالي.", bullets:["قلب ❤️ لحفظ القارئ في المفضلة","ربط سورة بعينها بقارئ بعينه"] },
    { icon:Moon, title:"إحصائياتك الحياتية", description:"٤ أرقام: تسبيحات، ختمات، أيام أذكار متواصلة، وأيام تدبر.", bullets:["خريطة حرارية ٩١ يوم زي GitHub 📊","تدرّج من الفاتح للذهبي الغامق"] },
  ];

  const whyNoorItems = [
    { icon:WifiOff, label:"يعمل بدون إنترنت تماماً" },
    { icon:Zap, label:"بدون إعلانات — صفر" },
    { icon:Shield, label:"بدون خوادم خارجية أو تتبع" },
    { icon:Lock, label:"بياناتك على جهازك فقط" },
    { icon:Package, label:"حجم التطبيق ٣٠ ميجا فقط" },
    { icon:BadgeCheck, label:"مجاني بالكامل — بدون اشتراك أبداً" },
  ];

  const bigStats = [
    { value: 34000, suffix: "+", label: "حديث نبوي شريف", sub: "الكتب الستة كاملة" },
    { value: 4975, suffix: "+", label: "حدث تاريخي", sub: "من السيرة للعثمانية" },
    { value: 5820, suffix: "", label: "سؤال اختبار", sub: "٣ مستويات صعوبة" },
    { value: 30, suffix: " MB", label: "فقط حجم التطبيق", sub: "مسجد في جيبك" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">

      {/* ── Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
        <motion.div className="h-full bg-gradient-to-l from-primary via-yellow-500 to-primary origin-right"
          style={{ scaleX: scrollProgress / 100, transformOrigin: "right" }} />
      </div>

      {/* ── Floating Download Button ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.a href={apkUrl} download="noor-app.apk" onClick={handleDownload}
            initial={{ opacity:0, scale:0.8, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.8, y:20 }}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-2xl btn-shimmer hover:opacity-90 hover:scale-105 transition-all"
            style={{ boxShadow: "0 8px 32px -4px hsl(var(--primary)/0.5)" }}>
            <Download className="w-4 h-4" />
            <span className="text-sm">تحميل نور</span>
          </motion.a>
        )}
      </AnimatePresence>

      {/* ── Download Toast ── */}
      <AnimatePresence>
        {downloadMsg && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl text-white text-sm font-bold ${downloadMsg==="success"?"bg-green-600":"bg-red-600"}`}>
            {downloadMsg==="success" ? "✅ تم تسجيل التحميل بنجاح" : "❌ فشل تسجيل التحميل — تحقق من الإنترنت"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════ */}
      <nav className="sticky top-0.5 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <img src="/noor-logo.webp" alt="نور" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-bold text-xl text-primary" style={{ fontFamily:"'Cairo',sans-serif" }}>تطبيق نور</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={apkUrl} download="noor-app.apk" onClick={handleDownload}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-shimmer hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" />تحميل التطبيق
            </a>
            <button onClick={toggleDark} aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"} className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center hover:bg-secondary transition-colors">
              {dark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content">

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 md:py-24 islamic-pattern">
        <motion.div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/6 blur-3xl pointer-events-none"
          animate={{ scale:[1,1.06,1], rotate:[0,6,0] }} transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }} />
        <motion.div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none"
          animate={{ scale:[1,1.08,1], rotate:[0,-6,0] }} transition={{ duration:15, repeat:Infinity, ease:"easeInOut" }} />

        <div className="max-w-2xl mx-auto px-4 flex flex-col items-center text-center gap-8 relative">

          {/* Badge */}
          <motion.div initial={{ opacity:0, y:-16, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.6, ease:[0.21,0.47,0.32,0.98] }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 text-primary text-sm font-bold backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              🌙 مجاني ١٠٠٪ • بدون إعلانات • ٣٠ ميجا فقط
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div className="relative"
            initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.7, delay:0.1, ease:[0.21,0.47,0.32,0.98] }}>
            <motion.div className="absolute inset-0 rounded-3xl bg-primary/25 blur-2xl scale-110"
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:3, repeat:Infinity }} />
            {/* Pulse rings */}
            <motion.div className="absolute inset-0 rounded-3xl border-2 border-primary/30"
              animate={{ scale:[1,1.3,1.5], opacity:[0.6,0.2,0] }} transition={{ duration:2.5, repeat:Infinity, ease:"easeOut" }} />
            <motion.div className="absolute inset-0 rounded-3xl border-2 border-primary/20"
              animate={{ scale:[1,1.5,1.8], opacity:[0.4,0.1,0] }} transition={{ duration:2.5, repeat:Infinity, ease:"easeOut", delay:0.5 }} />
            <img src="/noor-logo.webp" alt="شعار نور" className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover shadow-2xl" fetchPriority="high" loading="eager" />
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-3 leading-tight" style={{ fontFamily:"'Cairo',sans-serif" }}>
              <span className="gold-text">تطبيق نور</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-foreground/80">رفيقك الإسلامي الشامل</h2>
          </motion.div>

          <motion.p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.7, delay:0.35 }}>
            صُمِّم لمساعدة المسلمين على تعزيز صلتهم بالله وإحياء سنة النبي ﷺ في حياتهم اليومية.
            قرآن، صلاة، أذكار، وأكثر — كل ما تحتاجه في تطبيق واحد.
          </motion.p>

          {/* Phone */}
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.45 }}>
            <PhoneMockup dark={dark} />
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center w-full"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.6 }}>
            <a href={apkUrl} download="noor-app.apk" onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold btn-shimmer hover:opacity-90 hover:scale-105 transition-all shadow-xl">
              <Download className="w-5 h-5" />تحميل التطبيق الآن (APK)
            </a>
            <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary/40 text-primary text-lg font-semibold hover:bg-primary/10 transition-all">
              اكتشف المميزات
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAND — dark contrasting section
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-foreground dark:bg-card border-y border-border overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 islamic-pattern pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            {bigStats.map((s, i) => (
              <motion.div key={i} className={`text-center px-6 py-2 ${i < bigStats.length-1 ? "md:border-l border-background/20 dark:border-border" : ""}`}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ duration:0.55, delay:i*0.1 }}>
                <div className="text-3xl md:text-4xl font-black text-background dark:text-primary mb-1 tabular-nums">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-bold text-background/80 dark:text-foreground mb-0.5">{s.label}</div>
                <div className="text-xs text-background/50 dark:text-muted-foreground">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-14">
            <SectionOrnament />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">مميزات التطبيق</p>
            <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ fontFamily:"'Cairo',sans-serif" }}>
              كل ما يحتاجه <span className="gold-text">المسلم</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              مسجد وراديو وتليفزيون في الجيب — كل ده مساحته ٣٠ ميجا بس 🤍
            </p>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} bullets={f.bullets} />
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-4 max-w-6xl mx-auto px-4 py-3 ornament-divider">
        <div className="w-2 h-2 rotate-45 bg-primary/50 mx-auto" />
      </div>

      {/* ══════════════════════════════════════════════════
          WHY NOOR?
      ══════════════════════════════════════════════════ */}
      <section id="why-noor" className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <FadeUp className="text-center mb-14">
            <SectionOrnament />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">ليه نور؟</p>
            <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ fontFamily:"'Cairo',sans-serif" }}>
              مش زي أي <span className="gold-text">تطبيق تاني</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              لا خوادم خارجية ✦ لا تتبع ✦ لا إعلانات — وأنت مرتاح البال 🔒
            </p>
          </FadeUp>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl overflow-hidden border border-card-border shadow-2xl">
              {/* Header */}
              <div className="grid grid-cols-3 bg-primary/8 border-b border-card-border">
                <div className="p-4 md:p-5 font-bold text-sm text-muted-foreground flex items-center justify-center">الميزة</div>
                <div className="p-4 md:p-5 border-x border-card-border text-center">
                  <div className="flex flex-col items-center gap-2">
                    <img src="/noor-logo.webp" alt="نور" className="w-10 h-10 rounded-xl object-cover shadow-md" />
                    <span className="font-black text-primary text-base">نور</span>
                  </div>
                </div>
                <div className="p-4 md:p-5 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-xl">📱</div>
                    <span className="font-semibold text-muted-foreground text-sm">تطبيقات أخرى</span>
                  </div>
                </div>
              </div>

              {whyNoorItems.map((item, i) => (
                <motion.div key={i} className={`grid grid-cols-3 border-b border-card-border last:border-b-0 ${i%2===0?"bg-card":"bg-background"}`}
                  initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true, margin:"-30px" }}
                  transition={{ duration:0.5, delay:i*0.07 }}>
                  <div className="p-4 md:p-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-tight">{item.label}</span>
                  </div>
                  <div className="p-4 md:p-5 border-x border-card-border flex items-center justify-center">
                    <motion.div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30"
                      whileInView={{ scale:[0.5,1.3,1] }} viewport={{ once:true }} transition={{ duration:0.4, delay:i*0.07+0.25 }}>
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 stroke-[3]" />
                    </motion.div>
                  </div>
                  <div className="p-4 md:p-5 flex items-center justify-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20">
                      <X className="w-5 h-5 text-red-500 stroke-[3]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-4 max-w-6xl mx-auto px-4 py-3 ornament-divider">
        <div className="w-2 h-2 rotate-45 bg-primary/50 mx-auto" />
      </div>

      {/* ══════════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════════ */}
      <section id="reviews" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <FadeUp className="text-center mb-14">
            <SectionOrnament />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">آراء المستخدمين</p>
            <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ fontFamily:"'Cairo',sans-serif" }}>
              ماذا يقول <span className="gold-text">مستخدمونا؟</span>
            </h2>
            {reviews.length > 0 && (
              <motion.div className="flex items-center justify-center gap-4 mt-5"
                initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}>
                <div className="text-5xl font-black text-primary">{avgRating}</div>
                <div>
                  <StarRating rating={Math.round(parseFloat(avgRating))} />
                  <p className="text-xs text-muted-foreground mt-1">{reviews.length} تقييم</p>
                </div>
              </motion.div>
            )}
          </FadeUp>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-card border border-card-border rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 text-border" />
              <p>كن أول من يُقيّم التطبيق!</p>
            </div>
          ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {reviews.slice(0, 6).map((review) => (
                <ReviewCard key={review.id} review={review} ownToken={myTokens[review.id]}
                  onUpdated={u => setReviews(prev => prev.map(r => r.id===u.id?u:r))}
                  onDeleted={id => setReviews(prev => prev.filter(r => r.id!==id))} />
              ))}
            </StaggerGrid>
          )}

          {/* Review Form */}
          <FadeUp delay={0.1}>
            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-2 text-center">أضف تقييمك</h3>
              <p className="text-muted-foreground text-sm text-center mb-6">رأيك يساعدنا نطوّر التطبيق أكتر 🤍</p>
              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="mb-5 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-center font-semibold">
                    شكراً لك! تم إرسال تقييمك بنجاح. 🤍
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">الاسم *</label>
                  <input type="text" value={formName} onChange={e=>setFormName(e.target.value)} placeholder="اكتب اسمك هنا"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">التقييم *</label>
                  <StarRating rating={formRating} onChange={setFormRating} interactive />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">ملاحظتك <span className="text-muted-foreground font-normal">(اختياري)</span></label>
                  <textarea value={formComment} onChange={e=>setFormComment(e.target.value)}
                    placeholder="شاركنا رأيك في التطبيق..." rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" />
                </div>
                {submitError && <p className="text-destructive text-sm">{submitError}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed btn-shimmer">
                  {submitting ? "جارٍ الإرسال..." : "إرسال التقييم ✦"}
                </button>
              </form>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          DOWNLOAD CTA SECTION
      ══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/4 to-transparent pointer-events-none" />
        <FadeUp className="max-w-2xl mx-auto px-4 text-center">
          <div className="p-8 md:p-12 rounded-3xl border-2 border-primary/25 bg-primary/5 relative overflow-hidden">
            <motion.div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl"
              animate={{ scale:[1,1.2,1] }} transition={{ duration:4, repeat:Infinity }} />
            <motion.div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl"
              animate={{ scale:[1,1.2,1] }} transition={{ duration:5, repeat:Infinity, delay:1 }} />
            <div className="relative">
              <div className="text-5xl mb-4">🌙</div>
              <h2 className="text-2xl md:text-4xl font-black mb-3" style={{ fontFamily:"'Cairo',sans-serif" }}>
                مش تطبيق —<br /><span className="gold-text">ده مسجد في الجيب</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                +٣٤,٠٠٠ حديث ✦ +٤,٩٧٥ حدث تاريخي ✦ ٥,٨٢٠ سؤال اختبار<br />
                كل ده مجاني — بدون إعلانات — ٣٠ ميجا بس 😭🤍
              </p>
              <a href={apkUrl} download="noor-app.apk" onClick={handleDownload}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold btn-shimmer hover:opacity-90 hover:scale-105 transition-all shadow-2xl"
                style={{ boxShadow:"0 12px 40px -8px hsl(var(--primary)/0.5)" }}>
                <Download className="w-5 h-5" />حمّل تطبيق نور الآن
              </a>
              {downloadCount > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  انضم لـ +{downloadCount} مستخدم بيستخدموا نور كل يوم
                </p>
              )}
            </div>
          </div>
        </FadeUp>
      </section>

      </main>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer className="border-t border-border py-14 relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/noor-logo.webp" alt="نور" className="w-10 h-10 rounded-xl object-cover shadow-md" />
              <span className="font-black text-xl text-primary" style={{ fontFamily:"'Cairo',sans-serif" }}>تطبيق نور</span>
            </div>
            <p className="text-muted-foreground text-sm mb-8">رفيقك الإسلامي الشامل • القرآن • الصلاة • الأذكار</p>

            <div className="flex justify-center mb-8">
              <div className="px-10 py-6 rounded-2xl border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors shadow-md">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Made with care 🤍</p>
                <p className="text-xl md:text-2xl font-black text-foreground">
                  Designed &amp; Developed by <span className="gold-text">Seif Kamel</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-6">
              {["لا خوادم خارجية","لا تتبع","لا إعلانات","مجاني للأبد"].map((t,i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
                  {t}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground opacity-60">© {new Date().getFullYear()} تطبيق نور. جميع الحقوق محفوظة.</p>
          </FadeIn>
        </div>
      </footer>
    </div>
  );
}
