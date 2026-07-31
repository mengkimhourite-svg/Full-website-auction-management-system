export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-grid-overlay" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo.png" alt="AuctionPro logo" className="w-14 h-14 object-contain" />
          </div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
