import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import './_group.css';

const opportunity = {
  id: 'opportunity',
  world: 'mars',
  title: 'أوبورتشنيتي',
  short: 'Opportunity · MER-B',
  official: 'Mars Exploration Rover — Opportunity (MER-B)',
  story: `مرحبًا! أنا أوبورتشنيتي، ويمكنكم مناداتي أوبي!

أنا مركبة روبوتية أرسلتني وكالة ناسا إلى المريخ لأبحث عن أسراره، خصوصًا ما يتعلق بالمياه التي ربما وُجدت على سطحه منذ زمن بعيد.

بدأت رحلتي من الأرض في 7 يوليو عام 2003، وبعد رحلة طويلة وصلت إلى المريخ في 25 يناير عام 2004.

هبطت في منطقة ميريدياني بلانوم (Meridiani Planum)، وبدأت مغامرتي فوق سطحه الأحمر.

هل تعرفون كم كان من المفترض أن أعمل؟

كان العلماء يتوقعون أن تستمر مهمتي حوالي 90 يومًا مريخيًا فقط!

لكنني أحببت الاستكشاف كثيرًا، واستمررت في العمل لأكثر من 14 سنة أرضية!

خلال هذه السنوات، تجولت بين الصخور والتلال، والتقطت آلاف الصور، وأرسلت إلى الأرض معلومات علمية مهمة.

ومن أهم اكتشافاتي أن الصخور التي درستها تحمل أدلة على أن المياه السائلة أثرت في بيئة المريخ في الماضي.

لقد ساعدت العلماء على فهم أن المريخ كان مختلفًا عما نراه اليوم!

لكن في عام 2018، حدثت عاصفة غبار ضخمة غطت أجزاء واسعة من المريخ، وحجبت ضوء الشمس عن ألواحي الشمسية.

بدأت طاقتي تنخفض، ثم توقفت عن إرسال الإشارات إلى الأرض في 10 يونيو 2018.

حاول العلماء التواصل معي مرات كثيرة، لكنني لم أجب.

وفي 13 فبراير 2019، أعلنت ناسا رسميًا انتهاء مهمتي.

قد أكون توقفت عن العمل، لكنني تجاوزت كل التوقعات، وتركت وراءي إنجازات علمية لا تُنسى.

أنا أوبورتشنيتي... المستكشف الذي كانت مهمته قصيرة، لكن مغامرته استمرت أكثر من 14 عامًا!`,
  imageUrl: 'https://images-assets.nasa.gov/image/PIA21707/PIA21707~small.jpg',
  imageAlt: 'مشهد فوهة أوريون على المريخ كما التقطته كاميرا المركبة الجوالة أوبورتشنيتي.',
  imageCaption: 'فوهة أوريون كما رصدتها أوبورتشنيتي · صورة ناسا/JPL',
  imageSourceUrl: 'https://images.nasa.gov/details/PIA21707',
  nasaUrl: 'https://science.nasa.gov/mission/mars-exploration-rover-opportunity/',
};

function Character({ world, className = '' }: { world: 'moon' | 'mars'; className?: string }) {
  const moon = world === 'moon';
  return (
    <div className={`character ${className}`} role="img" aria-label={moon ? 'شخصية القمر' : 'شخصية المريخ'}>
      {moon ? (
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <ellipse cx="60" cy="66" rx="45" ry="42" fill="#d6d9e6" stroke="#f5f4fa" strokeWidth="3"/>
          <circle cx="34" cy="48" r="7" fill="#b8bdcf"/><circle cx="81" cy="37" r="5" fill="#b8bdcf"/><ellipse cx="79" cy="79" rx="9" ry="6" fill="#b8bdcf"/>
          <path d="M24 39Q14 13 57 17Q90 17 100 39L90 36Q67 28 30 42Z" fill="#ffd36d" stroke="#8f672a" strokeWidth="3"/>
          <path d="M55 17L63 6L69 19" fill="#f4a64e" stroke="#8f672a" strokeWidth="3"/>
          <ellipse cx="45" cy="59" rx="7" ry="10" fill="#273553"/><ellipse cx="75" cy="57" rx="7" ry="10" fill="#273553"/>
          <circle cx="47" cy="56" r="2.4" fill="white"/><circle cx="77" cy="54" r="2.4" fill="white"/>
          <path d="M48 76Q60 90 74 74" fill="none" stroke="#994d59" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="31" cy="71" r="6" fill="#f19a9b" opacity=".62"/><circle cx="86" cy="69" r="6" fill="#f19a9b" opacity=".62"/>
          <path d="M20 55L11 47M98 58L107 49" stroke="#f1f2f7" strokeWidth="7" strokeLinecap="round"/>
          <path d="M47 101L44 111M73 101L77 111" stroke="#ffd36d" strokeWidth="7" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="65" r="43" fill="#d76d51" stroke="#f6a27b" strokeWidth="3"/>
          <path d="M26 42Q45 20 70 23Q95 26 104 50Q79 42 60 50Q39 58 26 42Z" fill="#ef9468" opacity=".78"/>
          <path d="M21 48Q18 18 59 17Q100 17 102 48L93 44Q67 34 29 49Z" fill="#93dce4" stroke="#31516d" strokeWidth="3"/>
          <path d="M26 47L20 31M95 47L102 31" stroke="#b9f0ec" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="45" cy="62" rx="7" ry="10" fill="#293653"/><ellipse cx="74" cy="60" rx="7" ry="10" fill="#293653"/>
          <circle cx="47" cy="59" r="2.4" fill="white"/><circle cx="76" cy="57" r="2.4" fill="white"/>
          <path d="M46 79Q60 91 76 76" fill="none" stroke="#673944" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="31" cy="73" r="6" fill="#ffb184" opacity=".68"/><circle cx="88" cy="72" r="6" fill="#ffb184" opacity=".68"/>
          <path d="M21 61L11 53M99 62L109 54" stroke="#ef9a78" strokeWidth="7" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}

export function Current() {
  const paragraphs = opportunity.story.split('\n\n').filter(Boolean);
  const chunkSize = Math.ceil(paragraphs.length / 3);
  const chapters = [
    paragraphs.slice(0, chunkSize),
    paragraphs.slice(chunkSize, chunkSize * 2),
    paragraphs.slice(chunkSize * 2),
  ].filter((chapter) => chapter.length > 0);
  const totalSteps = chapters.length + 2;
  const stopNavigation = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div className="space-current" dir="rtl">
      <div className="app-shell">
        <header className="topbar">
          <a href="#" className="brand" aria-label="فضفضة فضائية — الصفحة الرئيسية" onClick={stopNavigation}>
            <span className="brand-mark">ف</span>
            <span>فضفضة فضائية<small>حكايات القمر والمريخ</small></span>
          </a>
          <div className="nav-actions">
            <a className="quiet-link" href="#" onClick={stopNavigation}>بوابة العوالم</a>
            <a className="quiet-link" href="#" onClick={stopNavigation}>الشهادة</a>
            <button className="button-secondary" type="button" aria-label="كتم المؤثرات الصوتية">
              <Volume2 size={17}/><span className="no-print">الصوت يعمل</span>
            </button>
            <div className="progress-pill" aria-label="تم اكتشاف 0 من 6 مركبات">
              <span className="progress-number">0/6</span><span>مكتشفاتي</span>
            </div>
          </div>
        </header>
        <main className="main-wrap">
          <a className="backlink" href="#" onClick={stopNavigation}><ArrowRight size={17}/> العودة إلى خريطة المريخ</a>
          <div className="story-layout">
            <aside className="story-aside">
              <div className="mission-art mars-art">
                <img className="mission-photo" src={opportunity.imageUrl} alt={opportunity.imageAlt}/>
                <span className="photo-caption">{opportunity.imageCaption}</span>
              </div>
              <div className="mission-meta">
                <span className="mission-badge mars-badge">مهمة مريخية</span>
                <h2>{opportunity.title}</h2>
                <p className="official-name" dir="ltr">{opportunity.official}</p>
                <a className="nasa-source" href={opportunity.imageSourceUrl} target="_blank" rel="noreferrer">الصورة الأصلية في أرشيف NASA <ChevronLeft size={15}/></a>
                <a className="nasa-source" href={opportunity.nasaUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', marginTop: 9 }}>مصدر معلومات المهمة <ChevronLeft size={15}/></a>
              </div>
            </aside>
            <article className="story-content">
              <span className="eyebrow">مغامرة تفاعلية · {opportunity.short}</span>
              <h1>{opportunity.title} تحكي قصتها</h1>
              <div className="adventure-progress">
                <div className="adventure-progress-label"><span>الفصل 1</span><span>1 من {totalSteps}</span></div>
                <div className="progress-track" role="progressbar" aria-label="تقدمك في مغامرة القصة" aria-valuemin={0} aria-valuemax={totalSteps} aria-valuenow={1}>
                  <div className="progress-fill" style={{ width: `${100 / totalSteps}%` }}/>
                </div>
              </div>
              <div className="story-coach">
                <Character world="mars" className="coach-avatar"/>
                <p><b>المريخ يقول:</b> اقرأ هذا الجزء على مهل. هناك سؤال صغير ينتظرك بعد الحكاية!</p>
              </div>
              <div className="narration" aria-label="أدوات السرد الصوتي">
                <button className="audio-button" type="button"><Play size={15}/> استمع لهذا الجزء</button>
                <button className="audio-button secondary" type="button"><RotateCcw size={15}/> إعادة</button>
                <label className="volume-control"><Volume2 size={15}/><span>الصوت</span><input type="range" min="0" max="1" step=".05" defaultValue=".85" aria-label="مستوى صوت السرد"/></label>
                <button className="audio-button secondary" type="button" aria-label="كتم المؤثرات"><VolumeX size={15}/> مؤثرات مكتومة</button>
              </div>
              <section className="chapter-card" aria-live="polite">
                <div className="chapter-heading">
                  <span className="chapter-kicker"><BookOpen size={15}/> الفصل 1 من {chapters.length}</span>
                  <span className="chapter-count">{chapters[0]?.length} مقاطع قصيرة</span>
                </div>
                <div className="story-text" lang="ar" dir="rtl">
                  {chapters[0]?.map((paragraph, index) => <p className="story-paragraph" key={index}>{paragraph}</p>)}
                </div>
              </section>
              <div className="story-cta chapter-actions">
                <button type="button" className="button-secondary"><ArrowRight size={16}/>عد إلى الخريطة</button>
                <button type="button" className="button-primary">تابع الحكاية <ArrowLeft size={17}/></button>
              </div>
            </article>
          </div>
        </main>
        <nav className="mobile-nav" aria-label="التنقل الرئيسي">
          <a href="#" onClick={stopNavigation}>العوالم</a><a href="#" onClick={stopNavigation}>القمر</a><a href="#" onClick={stopNavigation}>المريخ</a><a href="#" onClick={stopNavigation}>الشهادة</a>
        </nav>
      </div>
    </div>
  );
}
