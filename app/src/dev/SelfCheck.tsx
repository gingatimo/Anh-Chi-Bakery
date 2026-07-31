import { runSelfCheck } from '../engine/selfcheck';

export function SelfCheck() {
  const results = runSelfCheck();
  const allPass = results.every((r) => r.pass);
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontSize: 26 }}>Engine self-check</h1>
      <p data-testid="summary" style={{ fontSize: 22, fontWeight: 700, color: allPass ? 'var(--sage-dark)' : 'var(--rose-dark)' }}>
        {allPass ? '✓ TẤT CẢ ĐẠT' : '✗ CÓ LỖI'} — {results.filter((r) => r.pass).length}/{results.length}
      </p>
      <ul style={{ listStyle: 'none', display: 'grid', gap: 8, marginTop: 16 }}>
        {results.map((r) => (
          <li key={r.name} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-panel)', boxShadow: 'var(--shadow-soft)' }}>
            <strong style={{ color: r.pass ? 'var(--sage-dark)' : 'var(--rose-dark)' }}>{r.pass ? '✓' : '✗'}</strong>{' '}
            {r.name} {r.detail && <em style={{ color: 'var(--text-soft)' }}>— {r.detail}</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
