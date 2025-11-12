import React from 'react';
import '../../Styles/Services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      icon: '🏡',
      title: 'Property Sales',
      description: 'Expert guidance in buying and selling residential and commercial properties.',
      features: [
        'Property valuation and market analysis',
        'Professional photography and marketing',
        'Negotiation and closing assistance',
        'Legal documentation support'
      ]
    },
    {
      id: 2,
      icon: '🏗️',
      title: 'Land Development',
      description: 'Comprehensive land development services from planning to completion.',
      features: [
        'Site analysis and feasibility studies',
        'Urban planning and design',
        'Project management',
        'Environmental impact assessment'
      ]
    },
    {
      id: 3,
      icon: '📋',
      title: 'Property Management',
      description: 'Full-service property management for landlords and property owners.',
      features: [
        'Tenant screening and placement',
        'Rent collection and accounting',
        'Property maintenance and repairs',
        'Regular property inspections'
      ]
    },
    {
      id: 4,
      icon: '💼',
      title: 'Investment Consulting',
      description: 'Strategic property investment advice to maximize your returns.',
      features: [
        'Market research and analysis',
        'Investment portfolio management',
        'Risk assessment',
        'ROI optimization strategies'
      ]
    },
    {
      id: 5,
      icon: '🔑',
      title: 'Property Rentals',
      description: 'Find the perfect rental property or tenant for your property.',
      features: [
        'Rental property listings',
        'Tenant verification',
        'Lease agreement preparation',
        'Deposit management'
      ]
    },
    {
      id: 6,
      icon: '📊',
      title: 'Market Analysis',
      description: 'In-depth market research and property valuation services.',
      features: [
        'Comparative market analysis',
        'Property appraisal',
        'Investment opportunity identification',
        'Market trend reports'
      ]
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Initial Consultation',
      description: 'We meet with you to understand your needs, budget, and preferences.'
    },
    {
      step: '02',
      title: 'Property Search & Analysis',
      description: 'Our team identifies suitable properties and conducts thorough analysis.'
    },
    {
      step: '03',
      title: 'Site Visits & Inspections',
      description: 'We arrange property viewings and professional inspections.'
    },
    {
      step: '04',
      title: 'Negotiation & Closing',
      description: 'We negotiate the best deal and handle all closing procedures.'
    }
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive property management solutions tailored to your needs</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>What We Offer</h2>
            <p>Professional services to handle all your property needs</p>
          </div>

          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card-detailed">
                <div className="service-icon-large">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="learn-more-btn">Learn More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Process</h2>
            <p>How we help you achieve your property goals</p>
          </div>

          <div className="process-timeline">
            {processSteps.map((item, index) => (
              <div key={index} className="process-step">
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose PropertyHub?</h2>
            <p>Your trusted partner in property management</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">⭐</div>
              <h3>Expert Team</h3>
              <p>15+ years of experience in property management and real estate</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Personalized Service</h3>
              <p>Tailored solutions to meet your specific needs and goals</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💪</div>
              <h3>Proven Track Record</h3>
              <p>Over 1000 satisfied clients and successful transactions</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Trust & Transparency</h3>
              <p>Honest communication and transparent processes throughout</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Contact us today to discuss how we can help with your property needs</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Contact Us</button>
              <button className="btn btn-secondary">View Properties</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
