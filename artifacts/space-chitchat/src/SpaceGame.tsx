import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CircleHelp, Gamepad2, Heart, Play, RotateCcw, Shield, SkipForward, Sparkles, Star } from 'lucide-react';
import type { World } from './data';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 480;
const SHIP_Y = 394;
const GAME_SECONDS = 25;
const BEST_SCORE_KEY = 'space-chitchat-cosmic-game-best-v1';

type FallingObject = {
  id: number;
  x: number;
  y: number;
  speed: number;
  radius: number;
  kind: 'star' | 'rock';
  rotation: number;
};

type GameStatus = 'ready' | 'playing' | 'finished';

type GameView = {
  status: GameStatus;
  score: number;
  secondsLeft: number;
  shields: number;
};

export function isShipCollision(itemX: number, itemY: number, shipX: number) {
  return Math.abs(itemX - shipX) < 43 && Math.abs(itemY - SHIP_Y) < 30;
}

export function clampShipX(nextX: number) {
  return Math.max(42, Math.min(GAME_WIDTH - 42, nextX));
}

function readBestScore() {
  try {
    const score = Number(localStorage.getItem(BEST_SCORE_KEY) ?? 0);
    return Number.isFinite(score) ? Math.max(0, score) : 0;
  } catch {
    return 0;
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const size = point % 2 === 0 ? radius : radius * 0.43;
    const px = Math.cos(angle) * size;
    const py = Math.sin(angle) * size;
    if (point === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawScene(ctx: CanvasRenderingContext2D, shipX: number, items: FallingObject[], elapsed: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  sky.addColorStop(0, '#101630');
  sky.addColorStop(0.58, '#202b53');
  sky.addColorStop(1, '#473054');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (let index = 0; index < 68; index += 1) {
    const x = (index * 157 + 43) % GAME_WIDTH;
    const y = (index * 79 + Math.floor(elapsed * (8 + (index % 4)))) % GAME_HEIGHT;
    const radius = index % 9 === 0 ? 2 : 1;
    ctx.globalAlpha = 0.3 + ((index * 7) % 6) / 10;
    ctx.fillStyle = index % 5 === 0 ? '#ffd98a' : '#c9eaff';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const planetGlow = ctx.createRadialGradient(714, 114, 8, 714, 114, 118);
  planetGlow.addColorStop(0, '#ef9e85');
  planetGlow.addColorStop(0.72, '#b95858');
  planetGlow.addColorStop(1, '#b9585800');
  ctx.fillStyle = planetGlow;
  ctx.beginPath();
  ctx.arc(714, 114, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d17a6c';
  ctx.beginPath();
  ctx.arc(714, 114, 73, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e6a09055';
  ctx.beginPath();
  ctx.ellipse(690, 86, 26, 10, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#9bdff355';
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 10]);
  ctx.beginPath();
  ctx.ellipse(GAME_WIDTH / 2, GAME_HEIGHT + 20, 370, 92, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const item of items) {
    if (item.kind === 'star') {
      ctx.shadowColor = '#ffe27c';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffe27c';
      drawStar(ctx, item.x, item.y, item.radius, item.rotation);
    } else {
      ctx.shadowColor = '#ff9c7c';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#8b9bb2';
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.beginPath();
      ctx.moveTo(-item.radius, -item.radius * 0.35);
      ctx.lineTo(-item.radius * 0.54, -item.radius);
      ctx.lineTo(item.radius * 0.34, -item.radius * 0.83);
      ctx.lineTo(item.radius, -item.radius * 0.12);
      ctx.lineTo(item.radius * 0.73, item.radius * 0.78);
      ctx.lineTo(-item.radius * 0.16, item.radius);
      ctx.lineTo(-item.radius * 0.9, item.radius * 0.43);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }

  const flame = ctx.createLinearGradient(shipX, SHIP_Y + 13, shipX, SHIP_Y + 42);
  flame.addColorStop(0, '#fff0a8');
  flame.addColorStop(1, '#ff7c71');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(shipX - 10, SHIP_Y + 12);
  ctx.lineTo(shipX, SHIP_Y + 39 + Math.sin(elapsed * 14) * 5);
  ctx.lineTo(shipX + 10, SHIP_Y + 12);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = '#78e7fb';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#c8f7ff';
  ctx.beginPath();
  ctx.moveTo(shipX, SHIP_Y - 31);
  ctx.quadraticCurveTo(shipX + 31, SHIP_Y - 1, shipX + 23, SHIP_Y + 15);
  ctx.lineTo(shipX - 23, SHIP_Y + 15);
  ctx.quadraticCurveTo(shipX - 31, SHIP_Y - 1, shipX, SHIP_Y - 31);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#58a7d6';
  ctx.beginPath();
  ctx.ellipse(shipX, SHIP_Y - 3, 8, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd879';
  ctx.beginPath();
  ctx.ellipse(shipX - 27, SHIP_Y + 10, 8, 4, -0.4, 0, Math.PI * 2);
  ctx.ellipse(shipX + 27, SHIP_Y + 10, 8, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

export function SpaceGame({ world, missionTitle, nextHref, onContinue }: {
  world: World;
  missionTitle?: string;
  nextHref: string;
  onContinue: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemsRef = useRef<FallingObject[]>([]);
  const shipXRef = useRef(GAME_WIDTH / 2);
  const directionRef = useRef(0);
  const nextObjectIdRef = useRef(0);
  const viewRef = useRef<GameView>({ status: 'ready', score: 0, secondsLeft: GAME_SECONDS, shields: 3 });
  const [view, setView] = useState<GameView>(viewRef.current);
  const [bestScore, setBestScore] = useState(readBestScore);
  const [helpOpen, setHelpOpen] = useState(false);
  const isMoon = world === 'moon';

  const setGameView = useCallback((next: GameView) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const startGame = useCallback(() => {
    itemsRef.current = [];
    shipXRef.current = GAME_WIDTH / 2;
    directionRef.current = 0;
    nextObjectIdRef.current = 0;
    setHelpOpen(false);
    setGameView({ status: 'playing', score: 0, secondsLeft: GAME_SECONDS, shields: 3 });
  }, [setGameView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (view.status !== 'playing') {
      drawScene(ctx, shipXRef.current, [], GAME_SECONDS - view.secondsLeft);
      return;
    }

    let frame = 0;
    let lastFrame = 0;
    let lastHudUpdate = 0;
    let spawnElapsed = 0;
    let elapsed = 0;
    let score = 0;
    let shields = 3;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      directionRef.current = 0;
      const best = Math.max(bestScore, score);
      setBestScore(best);
      try { localStorage.setItem(BEST_SCORE_KEY, String(best)); } catch { /* The game remains playable if storage is unavailable. */ }
      setGameView({ status: 'finished', score, secondsLeft: 0, shields });
    };

    const tick = (timestamp: number) => {
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
      lastFrame = timestamp;
      elapsed += delta;
      spawnElapsed += delta;
      shipXRef.current = clampShipX(shipXRef.current + directionRef.current * 350 * delta);

      if (spawnElapsed >= 0.62) {
        spawnElapsed = 0;
        const kind = Math.random() < 0.7 ? 'star' : 'rock';
        itemsRef.current.push({
          id: nextObjectIdRef.current++,
          x: 35 + Math.random() * (GAME_WIDTH - 70),
          y: -24,
          speed: 150 + Math.random() * 90 + elapsed * 2,
          radius: kind === 'star' ? 13 : 19,
          kind,
          rotation: Math.random() * Math.PI * 2,
        });
      }

      const remaining: FallingObject[] = [];
      for (const item of itemsRef.current) {
        item.y += item.speed * delta;
        item.rotation += delta * (item.kind === 'star' ? 1.7 : 0.35);
        if (isShipCollision(item.x, item.y, shipXRef.current)) {
          if (item.kind === 'star') score += 1;
          else shields -= 1;
          continue;
        }
        if (item.y < GAME_HEIGHT + item.radius) remaining.push(item);
      }
      itemsRef.current = remaining;
      drawScene(ctx, shipXRef.current, itemsRef.current, elapsed);

      const secondsLeft = Math.max(0, GAME_SECONDS - Math.floor(elapsed));
      if (timestamp - lastHudUpdate > 120) {
        lastHudUpdate = timestamp;
        setGameView({ status: 'playing', score, secondsLeft, shields });
      }

      if (elapsed >= GAME_SECONDS || shields <= 0) {
        finish();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [bestScore, setGameView, view.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (viewRef.current.status !== 'playing') return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault();
        directionRef.current = -1;
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault();
        directionRef.current = 1;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || ['a', 'd'].includes(event.key.toLowerCase())) {
        directionRef.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onKeyUp as unknown as EventListener);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onKeyUp as unknown as EventListener);
    };
  }, []);

  const moveShipToPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    shipXRef.current = clampShipX(((event.clientX - rect.left) / rect.width) * GAME_WIDTH);
  };

  const setDirection = (direction: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    directionRef.current = direction;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stopDirection = () => { directionRef.current = 0; };

  return (
    <section className={`space-break ${isMoon ? 'moon-break' : 'mars-break'}`} dir="rtl">
      <div className="space-break-header">
        <span className="game-orbit-mark"><Gamepad2 size={22}/></span>
        <span className="eyebrow">استراحة بين المهمات</span>
        <h1>مهمة جمع النجوم</h1>
        <p>{missionTitle ? `أحسنت في اكتشاف ${missionTitle}! خذ استراحة قصيرة قبل مغامرتك التالية.` : 'خذ استراحة مرحة بين حكايات القمر والمريخ.'}</p>
      </div>

      <div className="game-scorebar" aria-live="polite">
        <div><Star size={18}/><span>النجوم</span><b>{view.score}</b></div>
        <div><Shield size={18}/><span>الحماية</span><b>{'●'.repeat(view.shields)}{'○'.repeat(3 - view.shields)}</b></div>
        <div><span className="game-clock">00:{String(view.secondsLeft).padStart(2, '0')}</span><span>الوقت</span></div>
        <div><Sparkles size={18}/><span>أفضل نتيجة</span><b>{bestScore}</b></div>
      </div>

      <div className={`game-stage ${view.status === 'playing' ? 'is-playing' : ''}`}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          aria-label="لعبة فضائية: حرّك المركبة لجمع النجوم وتفادي الصخور"
          onPointerDown={(event) => { if (view.status === 'playing') { event.currentTarget.setPointerCapture(event.pointerId); moveShipToPointer(event); } }}
          onPointerMove={(event) => { if (event.buttons > 0 && view.status === 'playing') moveShipToPointer(event); }}
        />
        {view.status === 'ready' && (
          <div className="game-overlay">
            <div className="game-overlay-card">
              <span className="game-overlay-icon"><Star size={34}/></span>
              <b>اجمع النجوم وتفادَ الصخور!</b>
              <span>لديك 25 ثانية و٣ دروع. لا تقلق، تقدمك في القصص محفوظ دائمًا.</span>
              <button className="button-primary" onClick={startGame}><Play size={17}/> ابدأ اللعب</button>
              <button className="game-text-button" onClick={onContinue}><SkipForward size={16}/> تخطَّ وتابع الاستكشاف</button>
            </div>
          </div>
        )}
        {view.status === 'finished' && (
          <div className="game-overlay">
            <div className="game-overlay-card">
              <span className="game-overlay-icon"><Sparkles size={34}/></span>
              <b>{view.shields === 0 ? 'مغامرة رائعة!' : 'أحسنت يا مستكشف!'}</b>
              <span>جمعت {view.score} من النجوم. أفضل نتيجة لك: {bestScore}.</span>
              <button className="button-primary" onClick={startGame}><RotateCcw size={17}/> العب مرة أخرى</button>
              <button className="button-secondary" onClick={onContinue}><ArrowLeft size={17}/> تابع الاستكشاف</button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="game-pad" aria-label="أزرار تحريك المركبة">
          <button
            type="button"
            aria-label="حرّك المركبة إلى اليمين"
            onPointerDown={setDirection(1)}
            onPointerUp={stopDirection}
            onPointerCancel={stopDirection}
            onLostPointerCapture={stopDirection}
          ><ArrowRight size={25}/></button>
          <span>حرّك المركبة</span>
          <button
            type="button"
            aria-label="حرّك المركبة إلى اليسار"
            onPointerDown={setDirection(-1)}
            onPointerUp={stopDirection}
            onPointerCancel={stopDirection}
            onLostPointerCapture={stopDirection}
          ><ArrowLeft size={25}/></button>
        </div>
        <button type="button" className="game-help-button" onClick={() => setHelpOpen((open) => !open)} aria-expanded={helpOpen}>
          <CircleHelp size={17}/> كيف ألعب؟
        </button>
        {helpOpen && <p className="game-help-note">استخدم السهمين أو زري التحريك، أو اسحب المركبة بإصبعك. اجمع النجوم الصفراء وابتعد عن الصخور.</p>}
      </div>

      <button type="button" className="game-return-link" onClick={onContinue}><ArrowLeft size={17}/> العودة إلى الاستكشاف</button>
      <span className="sr-only">المسار التالي بعد اللعبة: {nextHref}</span>
    </section>
  );
}
