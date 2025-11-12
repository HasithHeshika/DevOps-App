import React from 'react';
import '../../Styles/About.css';

const About = () => {
  const team = [
    {
      id: 1,
      name: 'John Silva',
      role: 'Founder & CEO',
      image: 'https://ui-avatars.com/api/?name=John+Silva&size=200&background=667eea&color=fff',
      bio: 'With 20+ years in real estate, John leads our vision of exceptional property services.'
    },
    {
      id: 2,
      name: 'Sarah Fernando',
      role: 'Head of Sales',
      image: 'https://ui-avatars.com/api/?name=Sarah+Fernando&size=200&background=764ba2&color=fff',
      bio: 'Sarah brings expertise in property sales and client relationship management.'
    },
    {
      id: 3,
      name: 'Michael Perera',
      role: 'Property Manager',
      image: 'https://ui-avatars.com/api/?name=Michael+Perera&size=200&background=667eea&color=fff',
      bio: 'Michael ensures all properties are maintained to the highest standards.'
    },
    {
      id: 4,
      name: 'Priya Jayasuriya',
      role: 'Investment Consultant',
      image: 'https://ui-avatars.com/api/?name=Priya+Jayasuriya&size=200&background=764ba2&color=fff',
      bio: 'Priya provides strategic investment advice for maximum returns.'
    }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service delivery.'
    },
    {
      icon: '🤝',
      title: 'Integrity',
      description: 'Honesty and transparency form the foundation of our business.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'We embrace technology and innovation to serve you better.'
    },
    {
      icon: '❤️',
      title: 'Client-Focused',
      description: 'Your success and satisfaction are our top priorities.'
    }
  ];

  const milestones = [
    {
      year: '2008',
      title: 'Company Founded',
      description: 'PropertyHub was established with a vision to revolutionize property management in Sri Lanka.'
    },
    {
      year: '2012',
      title: 'Expansion',
      description: 'Opened offices in major cities across Sri Lanka, expanding our reach and services.'
    },
    {
      year: '2018',
      title: '1000+ Properties',
      description: 'Successfully managed over 1000 properties, marking a significant milestone.'
    },
    {
      year: '2024',
      title: 'Digital Transformation',
      description: 'Launched advanced online platform for seamless property management.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About PropertyHub</h1>
          <p>Your trusted partner in property management since 2008</p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="company-overview">
        <div className="container">
          <div className="overview-content">
            <div className="overview-text">
              <h2>Who We Are</h2>
              <p>
                PropertyHub is Sri Lanka's leading property management and real estate services company.
                With over 15 years of experience, we've built a reputation for excellence, integrity,
                and exceptional service in the property industry.
              </p>
              <p>
                Our team of dedicated professionals is committed to helping clients navigate the complex
                world of real estate, whether you're buying your first home, investing in commercial
                property, or seeking professional property management services.
              </p>
              <p>
                We pride ourselves on our personalized approach, combining local market expertise with
                innovative technology to deliver results that exceed expectations.
              </p>
            </div>
            <div className="overview-stats">
              <div className="stat-box">
                <h3>15+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat-box">
                <h3>1000+</h3>
                <p>Happy Clients</p>
              </div>
              <div className="stat-box">
                <h3>500+</h3>
                <p>Properties Sold</p>
              </div>
              <div className="stat-box">
                <h3>50+</h3>
                <p>Expert Agents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To provide exceptional property management services that empower our clients to make
                informed real estate decisions, while maintaining the highest standards of integrity,
                professionalism, and customer service.
              </p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">🔮</div>
              <h3>Our Vision</h3>
              <p>
                To be Sri Lanka's most trusted and innovative property management company, recognized
                for our commitment to excellence, client satisfaction, and positive impact on the
                communities we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Journey</h2>
            <p>Key milestones in our company's history</p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-year">{milestone.year}</div>
                </div>
                <div className="timeline-content">
                  <h4>{milestone.title}</h4>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>Dedicated professionals committed to your success</p>
          </div>
          <div className="team-grid">
            {team.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Work With Us?</h2>
            <p>Join hundreds of satisfied clients who trust PropertyHub for their property needs</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-secondary">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
