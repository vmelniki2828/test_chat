import { useMemo, useState } from 'react';

const darkTheme = {
  colors: {
    background: '#0D0D0D',
    panel: '#111111',
    border: '#2D2D2D',
    text: '#ECECEC',
    muted: '#8E8E8E',
    accent: '#10A37F'
  }
};

const initialEntries = [
  {
    id: 1,
    user: 'ops_lead',
    message: 'Great response speed, support queue dropped by 34%.',
    ts: '18:04:12'
  },
  {
    id: 2,
    user: 'casino_team',
    message: 'Escalation flow is clear and easier for agents.',
    ts: '18:06:47'
  },
  {
    id: 3,
    user: 'fintech_pm',
    message: 'Payment-related tickets are resolved much faster now.',
    ts: '18:10:03'
  }
];

const pad = (n) => String(n).padStart(2, '0');
const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const TerminalEchoSection = () => {
  const [entries, setEntries] = useState(initialEntries);
  const [draft, setDraft] = useState('');
  const [recentId, setRecentId] = useState(null);

  const nextId = useMemo(
    () => (entries.length ? Math.max(...entries.map((e) => e.id)) + 1 : 1),
    [entries]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }

    const created = {
      id: nextId,
      user: 'you',
      message: text,
      ts: nowTime()
    };

    setEntries((prev) => [...prev, created]);
    setRecentId(created.id);
    setDraft('');
    window.setTimeout(() => setRecentId(null), 900);
  };

  return (
    <section
      style={{
        background: darkTheme.colors.background,
        color: darkTheme.colors.text,
        padding: '0 6vw 110px',
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif"
      }}
    >
      <style>
        {`
          .echo-blink {
            animation: echoBlink 1s steps(1, end) infinite;
          }
          @keyframes echoBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          .echo-line-enter {
            animation: echoLineIn 820ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes echoLineIn {
            0% { opacity: 0; transform: translateY(8px); filter: blur(4px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
        `}
      </style>
      <div style={{ margin: '0 auto', width: 'min(1320px, 100%)' }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: darkTheme.colors.muted,
            marginBottom: 18
          }}
        >
          Terminal Echo
        </div>
        <h2
          style={{
            margin: 0,
            marginBottom: 40,
            fontSize: 'clamp(28px, 4.8vw, 62px)',
            fontWeight: 300,
            letterSpacing: '0.07em',
            textTransform: 'uppercase'
          }}
        >
          Comments & Feedback
        </h2>

        <div
          style={{
            border: `1px solid ${darkTheme.colors.border}`,
            borderRadius: 20,
            background: darkTheme.colors.panel,
            overflow: 'hidden',
            boxShadow: '0 18px 60px rgba(0,0,0,0.45)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 16px',
              borderBottom: `1px solid ${darkTheme.colors.border}`
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            <span
              style={{
                marginLeft: 10,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: darkTheme.colors.muted
              }}
            >
              feedback.log
            </span>
          </div>

          <div style={{ padding: '20px 20px 8px', maxHeight: 360, overflowY: 'auto' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={entry.id === recentId ? 'echo-line-enter' : ''}
                style={{
                  marginBottom: 14,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
                }}
              >
                <span style={{ color: darkTheme.colors.accent }}>[{entry.ts}]</span>{' '}
                <span style={{ color: '#b8b8b8' }}>{entry.user}:</span>{' '}
                <span style={{ color: darkTheme.colors.text }}>{entry.message}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              borderTop: `1px solid ${darkTheme.colors.border}`,
              padding: '14px 16px 18px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: `1px solid ${darkTheme.colors.border}`,
                borderRadius: 12,
                padding: '10px 12px',
                background: '#0b0b0b'
              }}
            >
              <span
                style={{
                  color: darkTheme.colors.accent,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
                }}
              >
                &gt;
              </span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type feedback and press Enter..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: darkTheme.colors.text,
                  fontSize: 14
                }}
              />
              <span className="echo-blink" style={{ color: darkTheme.colors.accent }}>
                |
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
