export const metadata = {
  title: 'Terms of Service | EduPro',
};

export default function TermsOfServicePage() {
  return (
    <div className="article-container">
      <h1>Terms of Service</h1>
      <div className="article-body">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Terms</h2>
        <p>By accessing this Website, accessible from EduPro, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.</p>
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials on EduPro's Website for personal, non-commercial transitory viewing only.</p>
        <h2>3. Disclaimer</h2>
        <p>All the materials on EduPro's Website are provided "as is". EduPro makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, EduPro does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>
      </div>
    </div>
  );
}
