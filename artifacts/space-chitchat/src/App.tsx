import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, ChevronLeft, Gamepad2, Headphones, Home as HomeIcon, Lightbulb, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { missions, worldInfo, type Mission, type World } from './data';
import { SpaceGame } from './SpaceGame';

const STORAGE_KEY = 'space-chitchat-discovered-v1';

function readDiscovered(): string[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && missions.some((m) => m.id === id)) : [];
  } catch { return []; }
}

function Character({ world, className = '' }: { world: World; className?: string }) {
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

function playPop(muted: boolean) {
  if (muted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(640, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(340, context.currentTime + .08);
    gain.gain.setValueAtTime(.055, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .11);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .12);
    oscillator.onended = () => void context.close();
  } catch { /* Optional sound effect; interaction remains available without audio. */ }
}

function Shell({ children, discovered, muted, setMuted }: { children: React.ReactNode; discovered: string[]; muted: boolean; setMuted: (v: boolean) => void }) {
    const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.appendChild(div);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'ar', includedLanguages: 'en,ar', autoDisplay: false },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//://google.com';
      document.body.appendChild(script);

      const style = document.createElement('style');
      style.innerHTML = `.goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; } body { top: 0px !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = nextLang;
      select.dispatchEvent(new Event('change'));
    }
  };

  const [location] = useLocation();
  const moonCount = discovered.filter((id) => missions.find((m) => m.id === id)?.world === 'moon').length;
  const marsCount = discovered.filter((id) => missions.find((m) => m.id === id)?.world === 'mars').length;
  return (
    <div className="app-shell" dir="rtl">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="فضفضة فضائية — الصفحة الرئيسية">
          <span className="brand-mark">ف</span>
          <span>فضفضة فضائية<small>حكايات القمر والمريخ</small></span>
        </Link>
        <div className="nav-actions">
          <Link className="quiet-link" href="/">بوابة العوالم</Link>
          <Link className="quiet-link" href="/certificate">الشهادة</Link>
                    <button className="button-secondary" onClick={toggleLanguage} title="تغيير اللغة / Switch Language">
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button className="button-secondary" aria-label={muted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'} onClick={() => setMuted(!muted)} title="المؤثرات الصوتية">
            {muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}<span className="no-print">{muted ? 'الصوت مكتوم' : 'الصوت يعمل'}</span>
          </button>
          <div className="progress-pill" aria-label={`تم اكتشاف ${discovered.length} من 6 مركبات`}>
            <span className="progress-number">{discovered.length}/6</span><span>مكتشفاتي</span>
          </div>
        </div>
      </header>
      <main className="main-wrap">{children}</main>
      <nav className="mobile-nav" aria-label="التنقل الرئيسي">
        <Link href="/"><HomeIcon size={15}/> العوالم</Link><Link href="/explore/moon"><span>القمر</span></Link><Link href="/explore/mars"><span>المريخ</span></Link><Link href="/certificate"><Award size={15}/> الشهادة</Link>
      </nav>
      {location !== '/' && <span className="sr-only" aria-live="polite">التقدم: {discovered.length} من 6، القمر {moonCount} من 3، المريخ {marsCount} من 3.</span>}
    </div>
  );
}

function Dashboard({ discovered }: { discovered: string[] }) {
  const moon = discovered.filter((id) => missions.find((mission) => mission.id === id)?.world === 'moon').length;
  const mars = discovered.filter((id) => missions.find((mission) => mission.id === id)?.world === 'mars').length;
  const pct = Math.round(discovered.length / missions.length * 100);
  return (
    <section className="dashboard" aria-label="تقدم الاستكشاف">
      <div>
        <div className="dashboard-top"><span className="dashboard-title">دفتر المستكشف الصغير</span><span className="dashboard-value">{discovered.length} / 6 · {pct}٪</span></div>
        <div className="progress-track" role="progressbar" aria-label="نسبة إكمال الاستكشاف" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
      </div>
      <div className="stat-pair"><div className="stat"><b>{moon}/3</b>القمر</div><div className="stat"><b>{mars}/3</b>المريخ</div></div>
    </section>
  );
}

function HomePage({ discovered }: { discovered: string[] }) {
  const [started, setStarted] = useState(false);
  const allDone = discovered.length === 6;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">مهمتك تبدأ بسؤال</span>
          <h1>كل عالمٍ<br/><span>يخفي حكاية.</span></h1>
          <p>رافق القمر والمريخ في رحلة بين آثار حقيقية لمركبات شجاعة. استمع إلى قصصها، اكتشف أسرارها، واجمع شارات المستكشف.</p>
          <button className="button-primary" onClick={() => { setStarted(true); document.getElementById('worlds')?.scrollIntoView({ behavior:'smooth' }); }}>
            {started ? 'اختر وجهتك الآن' : 'يلا نكتشف أسرار الفضاء'} <ArrowLeft size={19}/>
          </button>
          {allDone && <Link href="/certificate" className="button-secondary" style={{ marginInlineStart:10 }}><Award size={18}/> شهادتك جاهزة</Link>}
          <div className="guide-row" style={{ marginTop:25 }}>
            <Character world="moon"/><p><strong>القمر:</strong> «أهلًا بك يا بطل! على سطحي آثار رحلات فضائية تاريخية.»<br/><strong style={{ color:'#f2a080' }}>المريخ:</strong> «وعندي حكايات روبوتات شجاعة بين صخوري الحمراء!»</p>
          </div>
        </div>
        <div className="hero-art" aria-label="القمر والمريخ في الفضاء">
          <div className="orbit"><span className="orbit-star s1">✦</span><span className="orbit-star s2">✧</span><span className="orbit-star s3">✦</span><div className="orbit-planet"><Character world="moon"/></div><div className="orbit-mars"><Character world="mars"/></div></div>
        </div>
      </section>
      <Dashboard discovered={discovered}/>
      <section id="worlds">
        <div className="section-heading"><div><span className="eyebrow">بوابة العوالم</span><h2>إلى أين نطير أولًا؟</h2></div><span className="eyebrow">عالمان · ست حكايات</span></div>
        <div className="world-grid">
          <WorldCard world="moon" count={discovered.filter((id) => missions.find((m) => m.id === id)?.world === 'moon').length}/>
          <WorldCard world="mars" count={discovered.filter((id) => missions.find((m) => m.id === id)?.world === 'mars').length}/>
        </div>
      </section>
      <section className="section-heading" style={{ marginTop:52 }}>
        <div><span className="eyebrow">كيف تبدأ المغامرة؟</span><h2>ثلاث خطوات، واكتشافات كثيرة.</h2></div>
      </section>
      <div className="world-grid">
          <div className="empty-note"><BookOpen size={23}/><br/><b>١ — اختر موقعًا</b><br/>العلامات على الخريطة تقودك إلى مغامرة قصيرة عن مركبة حقيقية.</div>
          <div className="empty-note"><Headphones size={23}/><br/><b>٢ — اقرأ واستمع</b><br/>اكتشف القصة فصلًا بعد فصل، وشغّل صوت الجزء الذي تقرؤه.</div>
      </div>
        <div className="award-banner" style={{ marginTop:15 }}><Award size={32} color="#ffd46c"/><p><b>٣ — جرّب تحدّي المستكشف</b><br/>أجب عن سؤالين خفيفين مع تلميحات، ثم أضف المركبة إلى دفتر إنجازك. فتح القصة وحده لا يُحتسب.</p></div>
    </>
  );
}

function WorldCard({ world, count }: { world: World; count: number }) {
  const isMoon = world === 'moon';
  return (
    <article className={`world-card ${isMoon ? '' : 'mars-card'}`}>
      <span className="eyebrow">{isMoon ? 'محطة رقم ١' : 'محطة رقم ٢'}</span>
      <h3>{worldInfo[world].title}</h3>
      <p>{worldInfo[world].subtitle}</p>
      <Link href={`/explore/${world}`} className="button-primary">استكشف {isMoon ? 'القمر' : 'المريخ'} <ArrowLeft size={17}/></Link>
      <div className="world-stat">{count} من 3 حكايات مكتشفة</div>
      <div className="world-guide"><Character world={world}/></div>
    </article>
  );
}

function WorldPage({ world, discovered, muted }: { world: World; discovered: string[]; muted: boolean }) {
  const isMoon = world === 'moon';
  const items = missions.filter((mission) => mission.world === world);
  return (
    <>
      <Link className="backlink" href="/"><ArrowRight size={17}/> العودة إلى اختيار العالم</Link>
      <div className="page-title"><Character world={world}/><div><span className="eyebrow">خريطة توضيحية تفاعلية</span><h1>{worldInfo[world].title}</h1><p>{isMoon ? 'القمر' : 'المريخ'} يهمس: «{worldInfo[world].subtitle}»</p></div></div>
      <Dashboard discovered={discovered}/>
      {discovered.length === 0 && <div className="guide-row" style={{ marginBottom:18 }}><Character world={world}/><p><strong>{isMoon ? 'القمر' : 'المريخ'} يقول:</strong> {isMoon ? 'يا سلام! وصلنا إلى سطحي! كل علامة تخفي قصة مركبة زارتني وتركت بصمتها.' : 'أهلًا بك في عالمي الأحمر! هنا روبوتات بحثت عن الماء ودرست الصخور وجابت السطح.'}</p></div>}
      <div className={`map-card ${isMoon ? '' : 'mars-map'}`}>
        <div className="map-topo"/><div className="map-land"/>
        <div className="map-caption">خريطة توضيحية · ليست مقياسًا جغرافيًا دقيقًا</div>
        {items.map((mission, i) => {
          const done = discovered.includes(mission.id);
          return <Link key={mission.id} href={`/explore/${world}/${mission.id}`} className={`marker ${done ? 'discovered' : ''}`} style={{ left:mission.marker.left,top:mission.marker.top }} aria-label={`${mission.title}، ${mission.site}${done ? ' — مكتشفة' : ' — ابدأ القصة'}`} onClick={() => playPop(muted)}>
            <span className="marker-pin"><span>{done ? <Check size={19}/> : i + 1}</span></span><span className="marker-label">{mission.short}</span>
          </Link>;
        })}
        <div className="map-disclaimer">المواضع رسومية لتسهيل الاستكشاف؛ لا تُعرض إحداثيات أو مسافات مختلقة.</div>
      </div>
      <div className="section-heading">
        <div><span className="eyebrow">ثلاث علامات على الخريطة</span><h2>اختر حكاية لتبدأ</h2></div>
        <Link href={`/space-break/${world}`} className="game-map-entry"><Gamepad2 size={18}/> استراحة فضائية <ArrowLeft size={16}/></Link>
      </div>
      <div className="story-list">
        {items.map((mission) => <StoryTile key={mission.id} mission={mission} done={discovered.includes(mission.id)}/>)}
      </div>
    </>
  );
}

function StoryTile({ mission, done }: { mission: Mission; done: boolean }) {
  return <Link href={`/explore/${mission.world}/${mission.id}`} className="story-tile">
    <div className="story-tile-top"><span className={`mission-badge ${mission.world === 'mars' ? 'mars-badge' : ''}`}>{mission.world === 'moon' ? 'القمر' : 'المريخ'}</span>{done && <span className="discovered-label"><Check size={14}/> مكتشفة</span>}</div>
    <h3>{mission.title}</h3><p>{mission.site}</p>
  </Link>;
}

function StoryPage({ mission, discovered, onComplete, muted, setMuted }: { mission: Mission; discovered: string[]; onComplete: (id: string) => void; muted: boolean; setMuted: (v: boolean) => void }) {
  const [, navigate] = useLocation();
  const done = discovered.includes(mission.id);
  const [speechAvailable, setSpeechAvailable] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const chapters = useMemo(() => {
    const paragraphs = mission.story.split('\n\n').filter(Boolean);
    const chunkSize = Math.ceil(paragraphs.length / 3);
    return [
      paragraphs.slice(0, chunkSize),
      paragraphs.slice(chunkSize, chunkSize * 2),
      paragraphs.slice(chunkSize * 2),
    ].filter((chapter) => chapter.length > 0);
  }, [mission.story]);
  const [activeStep, setActiveStep] = useState(0);
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'try-again' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const world = mission.world;
  const totalSteps = chapters.length + mission.challenges.length;
  const isChallenge = activeStep >= chapters.length;
  const challengeIndex = activeStep - chapters.length;
  const activeChallenge = isChallenge ? mission.challenges[challengeIndex] : null;
  const chapterText = (chapters[activeStep] ?? []).join('\n\n');
  const narratedText = activeChallenge
    ? `${activeChallenge.question} ${activeChallenge.options.join('. ')}`
    : chapterText;
  const guideWorld = activeStep % 2 === 0 ? world : world === 'moon' ? 'mars' : 'moon';
  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, [mission.id]);
  const speak = (restart: boolean) => {
    if (!('speechSynthesis' in window)) { setSpeechAvailable(false); return; }
    if (!restart && window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); setSpeaking(true); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narratedText);
    utterance.lang = 'ar-SA'; utterance.rate = .84; utterance.pitch = 1.08; utterance.volume = volume;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  };
  const moveToStep = (step: number) => {
    stop();
    setActiveStep(step);
    setShowHint(false);
    if (step >= chapters.length && solvedChallenges.includes(step - chapters.length)) {
      const question = mission.challenges[step - chapters.length];
      setSelectedAnswer(question.answer);
      setAnswerFeedback('correct');
    } else {
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const answerChallenge = (answer: number) => {
    if (!activeChallenge) return;
    setSelectedAnswer(answer);
    if (answer === activeChallenge.answer) {
      setAnswerFeedback('correct');
      setSolvedChallenges((current) => current.includes(challengeIndex) ? current : [...current, challengeIndex]);
      playPop(muted);
    } else {
      setAnswerFeedback('try-again');
    }
  };
  const markDone = () => {
    stop();
    onComplete(mission.id);
    navigate(`/space-break/${world}/${mission.id}`);
  };
  return (
    <>
      <Link className="backlink" href={`/explore/${world}`}><ArrowRight size={17}/> العودة إلى خريطة {worldInfo[world].label}</Link>
      <div className="story-layout">
        <aside className="story-aside">
           <div className={`mission-art ${world === 'mars' ? 'mars-art' : ''}`}>
             <img className="mission-photo" src={mission.imageUrl} alt={mission.imageAlt} loading="lazy" />
             <span className="photo-caption">{mission.imageCaption}</span>
           </div>
          <div className="mission-meta">
            <span className={`mission-badge ${world === 'mars' ? 'mars-badge' : ''}`}>{world === 'moon' ? 'مهمة قمرية' : 'مهمة مريخية'}</span>
            <h2>{mission.title}</h2><p className="official-name" dir="ltr">{mission.official}</p>
             <details className="mission-facts">
               <summary>افتح ملف المهمة والتفاصيل</summary>
               <dl className="fact-list">
                 <Fact label="النوع" value={mission.type}/><Fact label="الجهة" value="ناسا (NASA)"/>
                 <Fact label="الإطلاق" value={mission.launch}/><Fact label="الوصول" value={mission.arrival}/>
                 <Fact label="الموقع" value={mission.site}/><Fact label="الهدف" value={mission.purpose}/>
                 <Fact label="الإنجاز" value={mission.achievement}/><Fact label="الحالة" value={mission.status}/>
               </dl>
             </details>
             <a className="nasa-source" href={mission.imageSourceUrl} target="_blank" rel="noreferrer">الصورة الأصلية في أرشيف NASA <ChevronLeft size={15}/></a>
             <a className="nasa-source" href={mission.nasaUrl} target="_blank" rel="noreferrer" style={{ display:'flex', marginTop:9 }}>مصدر معلومات المهمة <ChevronLeft size={15}/></a>
          </div>
        </aside>
        <article className="story-content">
           <span className="eyebrow">مغامرة تفاعلية · {mission.short}</span>
           <h1>{mission.title} تحكي قصتها</h1>
           <div className="adventure-progress">
             <div className="adventure-progress-label"><span>{isChallenge ? 'تحدي المستكشف' : `الفصل ${activeStep + 1}`}</span><span>{activeStep + 1} من {totalSteps}</span></div>
             <div className="progress-track" role="progressbar" aria-label="تقدمك في مغامرة القصة" aria-valuemin={0} aria-valuemax={totalSteps} aria-valuenow={activeStep + 1}>
               <div className="progress-fill" style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}/>
             </div>
           </div>
           <div className="story-coach">
             <Character world={guideWorld} className="coach-avatar"/>
             <p><b>{guideWorld === 'moon' ? 'القمر' : 'المريخ'} يقول:</b> {isChallenge ? 'حان وقت التحدي! اختر إجابتك، وإذا احتجت مساعدة اطلب تلميحًا.' : 'اقرأ هذا الجزء على مهل. هناك سؤال صغير ينتظرك بعد الحكاية!'}</p>
           </div>
          <div className="narration" aria-label="أدوات السرد الصوتي">
             {!speechAvailable ? <span style={{ color:'#f1d795',fontSize:'.87rem' }}>الصوت غير متاح في هذا المتصفح. يمكن قراءة الجزء أو التحدي على الشاشة.</span> : <>
               {!speaking || paused ? <button className="audio-button" onClick={() => speak(false)} aria-label={paused ? 'استكمال السرد' : 'استمع إلى هذا الجزء'}><Play size={15}/> {paused ? 'استكمال' : 'استمع لهذا الجزء'}</button> : <button className="audio-button" onClick={() => { window.speechSynthesis.pause(); setPaused(true); }} aria-label="إيقاف السرد مؤقتًا"><Pause size={15}/> إيقاف مؤقت</button>}
               <button className="audio-button secondary" onClick={() => speak(true)} aria-label="إعادة تشغيل الجزء الحالي"><RotateCcw size={15}/> إعادة</button>
              <label className="volume-control"><Volume2 size={15}/><span>الصوت</span><input type="range" min="0" max="1" step=".05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="مستوى صوت السرد"/></label>
            </>}
            <button className="audio-button secondary" onClick={() => setMuted(!muted)} aria-label={muted ? 'تشغيل المؤثرات' : 'كتم المؤثرات'}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>} مؤثرات {muted ? 'مكتومة' : 'مفعّلة'}</button>
          </div>
           {!isChallenge ? (
             <section className="chapter-card" key={`chapter-${activeStep}`} aria-live="polite">
               <div className="chapter-heading"><span className="chapter-kicker"><BookOpen size={15}/> الفصل {activeStep + 1} من {chapters.length}</span><span className="chapter-count">{chapters[activeStep]?.length} مقاطع قصيرة</span></div>
               <div className="story-text" lang="ar" dir="rtl">{chapters[activeStep]?.map((paragraph, index) => <p className="story-paragraph" key={index}>{paragraph}</p>)}</div>
             </section>
           ) : activeChallenge && (
             <section className="challenge-card" key={`challenge-${challengeIndex}`} aria-live="polite">
               <div className="chapter-heading"><span className="chapter-kicker"><Sparkles size={16}/> تحدي المستكشف {challengeIndex + 1}</span><span className="chapter-count">{solvedChallenges.length} من {mission.challenges.length} إجابات صحيحة</span></div>
               <h2>{activeChallenge.question}</h2>
               <div className="challenge-options">
                 {activeChallenge.options.map((option, index) => (
                   <button
                     type="button"
                     key={option}
                     className={`challenge-option ${selectedAnswer === index && answerFeedback === 'correct' ? 'is-correct' : ''} ${selectedAnswer === index && answerFeedback === 'try-again' ? 'is-wrong' : ''}`}
                     onClick={() => answerChallenge(index)}
                     aria-pressed={selectedAnswer === index}
                   >
                     <span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}
                     {selectedAnswer === index && answerFeedback === 'correct' && <Check size={19}/>}
                   </button>
                 ))}
               </div>
               {answerFeedback === 'try-again' && <p className="challenge-feedback try-again" role="status">قريب! جرّب إجابة أخرى، أو افتح التلميح للمساعدة.</p>}
               {answerFeedback === 'correct' && <p className="challenge-feedback correct" role="status"><Check size={18}/>{activeChallenge.success}</p>}
               {answerFeedback !== 'correct' && <button type="button" className="hint-button" onClick={() => setShowHint((current) => !current)} aria-expanded={showHint}><Lightbulb size={17}/>{showHint ? 'أخفِ التلميح' : 'أعطني تلميحًا'}</button>}
               {showHint && <p className="hint-note"><Lightbulb size={16}/>{activeChallenge.hint}</p>}
             </section>
           )}
          {mission.id === 'eagle' && <div className="status-callout">تذكّر: مرحلة الهبوط بقيت على القمر، أما مرحلة الصعود فغادرت إلى المدار القمري.</div>}
          {mission.id === 'lrv' && <div className="status-callout">معلومة دقيقة: هذه عربة مأهولة نُقلت ضمن أبولو 15، وليست مركبة هبوط مستقلة.</div>}
          {mission.id === 'phoenix' && <div className="status-callout">فينيكس اكتشفت جليد الماء؛ لم تثبت وجود حياة على المريخ.</div>}
           <div className="story-cta chapter-actions">
             <button type="button" className="button-secondary" onClick={() => activeStep === 0 ? navigate(`/explore/${world}`) : moveToStep(activeStep - 1)}>
               <ArrowRight size={16}/>{activeStep === 0 ? 'عد إلى الخريطة' : 'الجزء السابق'}
             </button>
             {!isChallenge ? (
               <button type="button" className="button-primary" onClick={() => moveToStep(activeStep + 1)}>
                 {activeStep === chapters.length - 1 ? 'ابدأ تحدي المستكشف' : 'تابع الحكاية'} <ArrowLeft size={17}/>
               </button>
             ) : activeChallenge && answerFeedback === 'correct' && challengeIndex < mission.challenges.length - 1 ? (
               <button type="button" className="button-primary" onClick={() => moveToStep(activeStep + 1)}>السؤال التالي <ArrowLeft size={17}/></button>
             ) : activeChallenge && answerFeedback === 'correct' ? (
               <button type="button" className="button-primary" onClick={markDone}>
                 <Check size={17}/>{done ? 'اكتشفتها من قبل — عُد إلى الخريطة' : 'أكملت المهمة — احفظ الاكتشاف'}
               </button>
             ) : (
               <span className="challenge-nudge">أجب عن السؤال لتفتح الخطوة التالية.</span>
             )}
          </div>
        </article>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function CertificatePage({ discovered }: { discovered: string[] }) {
  const [name, setName] = useState('');
  const complete = discovered.length === 6;
  const date = new Intl.DateTimeFormat('ar', { day:'numeric',month:'long',year:'numeric' }).format(new Date());
  return (
    <div className="certificate-wrap">
      <Link className="backlink no-print" href="/"><ArrowRight size={17}/> العودة إلى الرحلة</Link>
      {complete ? <>
        <div className="award-banner no-print"><Character world="moon"/><p><b>يااا سلام! أصبحت مستكشفًا فضائيًا حقيقيًا!</b><br/>اكتشفت جميع المركبات الست. القمر والمريخ فخوران بك؛ حان وقت جائزتك.</p><Character world="mars"/></div>
        <section className="certificate" aria-label="شهادة مستكشف الفضاء">
          <div className="cert-stars" aria-hidden="true">✦　✧　✦</div>
          <span className="eyebrow">SPACE CHITCHAT · MOON & MARS TALES</span>
          <h1>SPACE EXPLORER</h1><h2>شهادة مستكشف الفضاء</h2>
          <p>تُمنح هذه الشهادة إلى</p>
          <label className="sr-only" htmlFor="child-name">اسم المستكشف أو المستكشفة</label>
          <input id="child-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="اكتب اسمك هنا" maxLength={50}/>
          <p>تقديرًا لإتمام رحلة استكشاف القمر والمريخ، والتعرف على ست مركبات فضائية حقيقية وقصصها ومهماتها العلمية.</p>
          <p style={{ color:'#ffdc88',fontWeight:800,fontSize:'1.2rem' }}>تهانينا! لقد أصبحت مستكشفًا فضائيًا متميزًا!</p>
          <div className="cert-footer"><span><b>المركبات المكتشفة</b><br/>6 / 6</span><span><b>تاريخ الحصول على الشهادة</b><br/><span className="cert-date">{date}</span></span></div>
          <div style={{ marginTop:25,display:'flex',justifyContent:'center',gap:24 }}><Character world="moon"/><Character world="mars"/></div>
        </section>
        <div className="certificate-actions no-print"><button className="button-primary" onClick={() => window.print()}>اطبع أو احفظ PDF <Award size={17}/></button><Link href="/explore/moon" className="button-secondary">عد إلى المغامرة</Link></div>
      </> : <>
        <div className="page-title"><div><span className="eyebrow">جائزة المستكشف الصغير</span><h1>الشهادة تنتظرك!</h1><p>أكمل الحكايات الست لفتح شهادة مستكشف الفضاء.</p></div></div>
        <Dashboard discovered={discovered}/>
        <div className="empty-note"><Award size={28}/><br/><b>باقي لك {6 - discovered.length} حكاية{discovered.length === 5 ? '' : ''}!</b><br/>تقدمك محفوظ على هذا الجهاز. كل قصة تكتمل تُقرّبك خطوة من جائزتك.<br/><Link className="button-primary" style={{ marginTop:17 }} href={discovered.some((id) => missions.find((m) => m.id === id)?.world === 'moon') ? '/explore/mars' : '/explore/moon'}>تابع الاستكشاف <ArrowLeft size={17}/></Link></div>
      </>}
    </div>
  );
}

function NotFound() {
  return <section className="not-found"><span className="eyebrow">الإشارة ضاعت بين النجوم</span><h1>هذه المحطة غير موجودة.</h1><Link className="button-primary" href="/">ارجع إلى بوابة العوالم</Link></section>;
}

function App() {
  const [discovered, setDiscovered] = useState<string[]>(readDiscovered);
  const [muted, setMuted] = useState(true);
  const [location] = useLocation();
  const [, params] = useRoute('/explore/:world/:id');
  const [isWorld, worldParams] = useRoute('/explore/:world');
  const [, gameMissionParams] = useRoute('/space-break/:world/:missionId');
  const [, gameWorldParams] = useRoute('/space-break/:world');
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(discovered)); } catch { /* Progress remains in memory if storage is unavailable. */ } }, [discovered]);
  useEffect(() => { window.scrollTo({ top:0,behavior:'smooth' }); }, [location]);
  const complete = (id: string) => setDiscovered((old) => old.includes(id) ? old : [...old,id]);
  const mission = params?.id ? missions.find((item) => item.id === params.id) : undefined;
  const validWorld = worldParams?.world === 'moon' || worldParams?.world === 'mars' ? worldParams.world as World : null;
  const gameWorldValue = gameMissionParams?.world ?? gameWorldParams?.world;
  const gameWorld = gameWorldValue === 'moon' || gameWorldValue === 'mars' ? gameWorldValue as World : null;
  const completedMission = gameMissionParams?.missionId
    ? missions.find((item) => item.id === gameMissionParams.missionId && item.world === gameWorld)
    : undefined;
  const gameNextHref = discovered.length === missions.length ? '/certificate' : `/explore/${gameWorld ?? 'moon'}`;
  return (
    <Shell discovered={discovered} muted={muted} setMuted={setMuted}>
      <Switch>
        <Route path="/"><HomePage discovered={discovered}/></Route>
        <Route path="/explore/:world/:id">
          {mission ? <StoryPage mission={mission} discovered={discovered} onComplete={complete} muted={muted} setMuted={setMuted}/> : <NotFound/>}
        </Route>
        <Route path="/explore/:world">
          {isWorld && validWorld ? <WorldPage world={validWorld} discovered={discovered} muted={muted}/> : <NotFound/>}
        </Route>
        <Route path="/space-break/:world/:missionId">
          {gameWorld && completedMission
            ? <SpaceGame world={gameWorld} missionTitle={completedMission.title} nextHref={gameNextHref} onContinue={() => navigate(gameNextHref)}/>
            : <NotFound/>}
        </Route>
        <Route path="/space-break/:world">
          {gameWorld
            ? <SpaceGame world={gameWorld} nextHref={gameNextHref} onContinue={() => navigate(gameNextHref)}/>
            : <NotFound/>}
        </Route>
        <Route path="/certificate"><CertificatePage discovered={discovered}/></Route>
        <Route><NotFound/></Route>
      </Switch>
    </Shell>
  );
}

export default App;
