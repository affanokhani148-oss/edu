export const metadata = {
  title: 'Privacy Policy | EduPro',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="article-container">
      <h1>Privacy Policy</h1>
      <div className="article-body">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Introduction</h2>
        <p>Welcome to EduPro. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.</p>
        <h2>2. Cookies and Web Beacons</h2>
        <p>We use cookies to store information about visitors' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors' browser type or other information that the visitor sends via their browser.</p>
        <h2>3. Google AdSense</h2>
        <p>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</p>
        <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Ads Settings</a>.</p>
      </div>
    </div>
  );
}
