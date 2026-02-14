import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Sample data for featured properties
  const featuredProperties = [
    {
      id: 1,
      title: "Modern Villa in Colombo",
      price: "₹25,000,000",
      location: "Colombo 07",
      type: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      area: "3,500 sq ft",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Commercial Land",
      price: "₹15,000,000",
      location: "Galle Road",
      type: "Commercial",
      area: "5,000 sq ft",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Luxury Apartment",
      price: "₹8,500,000",
      location: "Mount Lavinia",
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,800 sq ft",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"
    }
  ];

  const heroSlides = [
    {
      title: "Find Your Dream Property",
      subtitle: "Discover the perfect land or property for your future",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop"
    },
    {
      title: "Professional Property Management",
      subtitle: "Expert services for all your property needs",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=600&fit=crop"
    },
    {
      title: "Trusted Real Estate Partner",
      subtitle: "Your journey to property ownership starts here",
      image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1200&h=600&fit=crop"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay">
                <div className="hero-content">
                  <h1 className={`hero-title ${isVisible ? 'animate-in' : ''}`}>
                    {slide.title}
                  </h1>
                  <p className={`hero-subtitle ${isVisible ? 'animate-in delay-1' : ''}`}>
                    {slide.subtitle}
                  </p>
                  <div className={`hero-buttons ${isVisible ? 'animate-in delay-2' : ''}`}>
                    <button className="btn btn-primary" onClick={() => navigate('/properties')}>
                      Browse Properties
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button className="hero-nav prev" onClick={prevSlide}>
          <i className="arrow-left">‹</i>
        </button>
        <button className="hero-nav next" onClick={nextSlide}>
          <i className="arrow-right">›</i>
        </button>

        {/* Slide indicators */}
        <div className="hero-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <h3>Hasith Heshika</h3>
            <div className="search-form">
              <div className="search-group">
                <label>Property Type</label>
                <select>
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </div>
              <div className="search-group">
                <label>Location</label>
                <input type="text" placeholder="Enter city or area" />
              </div>
              <div className="search-group">
                <label>Price Range</label>
                <select>
                  <option>Any Price</option>
                  <option>Under ₹5M</option>
                  <option>₹5M - ₹15M</option>
                  <option>₹15M - ₹30M</option>
                  <option>Above ₹30M</option>
                </select>
              </div>
              <button className="search-btn">Search Properties</button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive property management solutions tailored to your needs</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🏡</div>
              <h3>Property Sales</h3>
              <p>Find and purchase your ideal residential or commercial property with our expert guidance.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🏗️</div>
              <h3>Land Development</h3>
              <p>Professional land development services from planning to project completion.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Property Management</h3>
              <p>Complete property management services including maintenance, leasing, and tenant relations.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💼</div>
              <h3>Investment Consulting</h3>
              <p>Strategic property investment advice to maximize your returns and portfolio growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="featured-properties">
        <div className="container">
          <div className="section-header">
            <h2>Featured Properties</h2>
            <p>Discover our handpicked selection of premium properties</p>
          </div>
          <div className="properties-grid">
            {featuredProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  <img src={property.image} alt={property.title} />
                  <div className="property-badge">{property.type}</div>
                </div>
                <div className="property-content">
                  <h3>{property.title}</h3>
                  <p className="property-location">📍 {property.location}</p>
                  <div className="property-details">
                    {property.bedrooms && <span>🛏️ {property.bedrooms} Beds</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms} Baths</span>}
                    <span>📐 {property.area}</span>
                  </div>
                  <div className="property-footer">
                    <span className="property-price">{property.price}</span>
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="btn btn-outline" onClick={() => navigate('/properties')}>
              View All Properties
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Properties Sold</p>
            </div>
            <div className="stat-item">
              <h3>1000+</h3>
              <p>Happy Clients</p>
            </div>
            <div className="stat-item">
              <h3>15+</h3>
              <p>Years Experience</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Expert Agents</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Dream Property?</h2>
            <p>Join thousands of satisfied customers who found their perfect property with us.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/properties')}>
                Get Started
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/contact')}>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;