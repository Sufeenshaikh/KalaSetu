import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import BackButton from '../components/BackButton';

const Step = ({ number, title, description }: { number: string; title: string; description: string }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl font-heading">
            {number}
        </div>
        <div className="ml-6">
            <h4 className="text-2xl font-heading font-bold text-secondary">{title}</h4>
            <p className="mt-1 text-text-secondary">{description}</p>
        </div>
    </div>
);


const ForArtisansPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="bg-accent/30 py-20 text-center">
        <div className="container mx-auto px-6">
          <div className="text-left">
            <BackButton />
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-secondary">Share Your Craft with the World</h1>
          <p className="mt-4 text-xl text-text-secondary max-w-3xl mx-auto">Join KalaSetu and connect with a global audience that values handmade quality and cultural heritage.</p>
          <Link to="/signup">
            <Button className="mt-8 text-lg">Register Now</Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6">
        <div className="text-center">
            <h2 className="text-4xl font-heading font-bold text-secondary mb-12">Why Sell with KalaSetu?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-heading font-bold text-secondary mb-3">Professional Photos</h3>
                <p className="text-text-secondary">We provide professional photography services to make your products shine and attract more customers.</p>
            </div>
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-heading font-bold text-secondary mb-3">Compelling Stories</h3>
                <p className="text-text-secondary">Our team, with the help of AI, helps you craft a compelling story that connects with buyers on a deeper level.</p>
            </div>
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-heading font-bold text-secondary mb-3">Your Own Voice</h3>
                <p className="text-text-secondary">We empower you to tell your story in your own voice, preserving the authenticity and soul of your craft.</p>
            </div>
        </div>
      </section>

      {/* Step-by-step Guide */}
      <section className="bg-surface py-20">
          <div className="container mx-auto px-6">
              <div className="text-center">
                  <h2 className="text-4xl font-heading font-bold text-secondary mb-16">Getting Started is Easy</h2>
              </div>
              <div className="max-w-3xl mx-auto space-y-12">
                  <Step number="1" title="Register" description="Create your artisan account to get started on your journey with us."/>
                  <Step number="2" title="Submit Application" description="After creating an account, you'll be directed to fill out a simple form with your details."/>
                  <Step number="3" title="Onboarding" description="Our team will contact you to schedule a visit for photography and to hear your story."/>
                  <Step number="4" title="Start Selling" description="We'll help you create beautiful product listings for your online shop on KalaSetu."/>
              </div>
          </div>
      </section>
    </div>
  );
};

export default ForArtisansPage;