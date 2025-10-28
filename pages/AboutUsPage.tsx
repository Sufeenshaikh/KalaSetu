
import React from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-surface">
      <div className="container mx-auto px-6 py-20 space-y-20">
        <BackButton />
        {/* Mission Section */}
        <section className="text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-secondary">Our Mission</h1>
          <p className="mt-6 text-xl text-text-secondary max-w-3xl mx-auto">
            KalaSetu, meaning 'Art Bridge' in Hindi, was founded on a simple yet powerful idea: to create a sustainable and empowering bridge between India’s gifted artisans and a global audience that appreciates authentic, handcrafted goods.
          </p>
        </section>

        {/* The Problem & Our Solution */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img src="https://assets.gqindia.com/photos/6830239d149f12e4f533a38b/16:9/w_2560%2Cc_limit/art-villages-in-India.jpg" alt="Artisan hands" className="rounded-lg shadow-xl" />
          </div>
          <div>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-4">The Challenge</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Millions of artisans in India are keepers of centuries-old traditions, creating breathtaking works of art. However, many face significant barriers, including limited market access, unfair wages, and a lack of resources to tell their stories. This disconnect threatens not only their livelihoods but the survival of their precious cultural heritage.
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary mb-4">Our Solution</h2>
            <p className="text-text-secondary leading-relaxed">
              KalaSetu is more than just an e-commerce platform. We partner directly with artisans and cooperatives across India, providing them with the tools, technology, and support they need to thrive in the digital age. We ensure fair compensation, help them share their stories, and connect them directly with conscious consumers like you.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
                <img src="https://idronline.org/wp-content/uploads/2022/01/woman-artisan-standing-in-front-of-a-rug_Jaipur-Rugs-4_resize.jpg" alt="Team" className="rounded-lg shadow-xl" />
            </div>
            <div className="md:order-1">
                <h2 className="text-4xl font-heading font-bold text-secondary mb-4">Our Story</h2>
                <p className="text-text-secondary leading-relaxed">
                    Founded by a team of art lovers, tech enthusiasts, and social entrepreneurs, KalaSetu was born from a deep respect for India's artistic traditions. During our travels, we were moved by the incredible talent we witnessed and the challenges these artisans faced. We knew that technology could be a powerful force for good, and we set out to build a platform that was both beautiful and impactful.
                </p>
            </div>
        </section>
        
        {/* CTA */}
        <section className="text-center bg-accent/20 py-16 rounded-lg">
            <h2 className="text-4xl font-heading font-bold text-secondary">Join the KalaSetu Movement</h2>
            <p className="mt-4 text-xl text-text-secondary max-w-3xl mx-auto">
                Every purchase you make helps support an artisan, their family, and their community. You're not just buying a product; you're preserving a piece of cultural history.
            </p>
            <div className="mt-8">
                <Link to="/shop">
                    <Button>Shop with Purpose</Button>
                </Link>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;