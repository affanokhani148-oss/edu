import AdPlaceholder from '../../components/AdPlaceholder';

export const metadata = {
  title: 'About Us | EduPro',
  description: 'Learn more about EduPro and our mission to provide high-quality educational content.',
};

export default function AboutPage() {
  return (
    <div className="article-container">
      <h1>About EduPro</h1>
      <AdPlaceholder slotId="ABOUT_TOP" />
      <div className="article-body">
        <p>
          Welcome to EduPro, your ultimate destination for high-quality, professional educational content. 
          Our mission is to empower learners worldwide by providing accessible, well-structured, and deeply 
          insightful articles across a variety of disciplines.
        </p>
        <h2>Our Vision</h2>
        <p>
          We believe that education is the key to unlocking human potential. Through carefully curated daily 
          articles, we strive to make complex topics simple and engaging.
        </p>
        <h2>Join Us</h2>
        <p>
          Whether you're a student looking to ace your exams, a professional aiming to upskill, or simply a 
          curious mind, EduPro has something for you. Explore our daily uploads and take the next step in 
          your educational journey.
        </p>
      </div>
    </div>
  );
}
