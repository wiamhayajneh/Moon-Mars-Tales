import { useEffect } from 'react';

export function SpaceGame() {
  useEffect(() => {
    window.location.href = '/game/index.html';
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
      جاري فتح اللعبة...
    </div>
  );
}
