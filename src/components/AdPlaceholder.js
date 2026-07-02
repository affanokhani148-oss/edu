export default function AdPlaceholder({ className = '', slotId = 'AUTO' }) {
  return (
    <div className={`ad-container ${className}`} style={{ minHeight: '1px' }}>
      {/* 
        This is where AdSense injects the banner. 
        If AdSense is active, it fills this div. 
        If not, the div remains effectively invisible, keeping the site looking professional.
      */}
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-0000000000000000"
           data-ad-slot={slotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
