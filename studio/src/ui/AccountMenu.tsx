/**
 * The account button at the end of the top bar, shown only when the studio
 * server requires sign-in: "Sign in", or the user's picture with a menu of the
 * plan, today's sessions and Sign out.
 */
import { useEffect, useRef, useState } from 'react';
import type { Account } from '../voice/liveToken';
import { Icon, useStudio } from './context';

const PLAN: Record<Account['plan'], string> = { free: 'Free plan', pro: 'Pro plan', owner: 'Owner' };

function Avatar({ account, size }: { account: Account; size: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (account.name || account.email).trim().charAt(0).toUpperCase();
  if (account.picture && !failed) {
    return (
      <img className="avatar" src={account.picture} alt="" width={size} height={size}
        referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    );
  }
  return <span className="avatar initial" style={{ width: size, height: size }} aria-hidden="true">{initial}</span>;
}

export function AccountMenu() {
  const { auth, requestSignIn, signOut } = useStudio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!auth.required) return null;
  const account = auth.configured ? auth.account : null;
  if (account == null) {
    return (
      <button type="button" className="tonal-btn sign-in-btn" onClick={requestSignIn}>
        <Icon name="login" size={18} /> Sign in
      </button>
    );
  }

  const usage = account.limit == null
    ? `${account.used} ${account.used === 1 ? 'session' : 'sessions'} today`
    : `${account.used} of ${account.limit} sessions used today`;
  return (
    <div className="menu-anchor" ref={ref}>
      <button type="button" className="account-btn" onClick={() => setOpen(!open)}
        aria-haspopup="menu" aria-expanded={open} aria-label={`Account: ${account.email}`} data-tooltip={account.email}>
        <Avatar account={account} size={32} />
      </button>
      {open && (
        <div className="menu account-menu" role="menu">
          <div className="account-head">
            <Avatar account={account} size={40} />
            <span>
              {account.name && <strong>{account.name}</strong>}
              <small>{account.email}</small>
            </span>
          </div>
          <div className="account-plan">
            <Icon name="workspace_premium" size={20} />
            <span>{PLAN[account.plan]}<small>{usage}</small></span>
          </div>
          {account.limit != null && (
            <div className="account-meter" role="meter" aria-label="Sessions used today"
              aria-valuemin={0} aria-valuemax={account.limit} aria-valuenow={account.used}>
              <i style={{ width: `${Math.min(100, (account.used / Math.max(1, account.limit)) * 100)}%` }} />
            </div>
          )}
          <div className="menu-divider" />
          <button type="button" role="menuitem" onClick={() => { setOpen(false); signOut(); }}>
            <Icon name="logout" size={20} /><span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
