import React, { useState } from 'react';
import '../../Styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send form data to backend API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 Main Street', 'Colombo 07, Sri Lanka']
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+94 11 234 5678', '+94 77 123 4567']
    },
    {
      icon: '✉️',
      title: 'Email Us',
      details: ['info@propertyhub.lk', 'support@propertyhub.lk']
    },
    {
      icon: '🕐',
      title: 'Business Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 9:00 AM - 2:00 PM']
    }
  ];

  const offices = [
    {
      city: 'Colombo',
      address: '123 Main Street, Colombo 07',
      phone: '+94 11 234 5678',
      email: 'colombo@propertyhub.lk'
    },
    {
      city: 'Kandy',
      address: '45 Peradeniya Road, Kandy',
      phone: '+94 81 222 3333',
      email: 'kandy@propertyhub.lk'
    },
    {
      city: 'Galle',
      address: '78 Galle Road, Galle',
      phone: '+94 91 222 4444',
      email: 'galle@propertyhub.lk'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Let's discuss your property needs.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div className="info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx}>{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-container">
              <h2>Send Us a Message</h2>
              <p className="form-description">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {submitted && (
                <div className="success-message">
                  ✓ Thank you! Your message has been sent successfully.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="property-inquiry">Property Inquiry</option>
                    <option value="buying">Buying Property</option>
                    <option value="selling">Selling Property</option>
                    <option value="management">Property Management</option>
                    <option value="investment">Investment Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="map-container">
              <div className="map-placeholder">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80820034267!2d79.82743582!3d6.927078599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120b1509%3A0x2db2c18a68712863!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1699000000000!5m2!1sen!2s"
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '15px' }}
                  allowFullScreen=""
                  loading="lazy"
                  title="PropertyHub Location"
                ></iframe>
              </div>

              <div className="office-hours-card">
                <h3>Business Hours</h3>
                <div className="hours-list">
                  <div className="hours-item">
                    <span className="day">Monday - Friday</span>
                    <span className="time">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Saturday</span>
                    <span className="time">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Sunday</span>
                    <span className="time">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="offices-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Office Locations</h2>
            <p>Visit us at any of our convenient locations across Sri Lanka</p>
          </div>

          <div className="offices-grid">
            {offices.map((office, index) => (
              <div key={index} className="office-card">
                <h3>{office.city}</h3>
                <div className="office-details">
                  <p><span className="icon">📍</span> {office.address}</p>
                  <p><span className="icon">📞</span> {office.phone}</p>
                  <p><span className="icon">✉️</span> {office.email}</p>
                </div>
                <button className="directions-btn">Get Directions</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>How quickly will you respond to my inquiry?</h4>
              <p>We typically respond to all inquiries within 24 hours during business days.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer property viewing appointments?</h4>
              <p>Yes! We arrange property viewings at your convenience, including evenings and weekends.</p>
            </div>
            <div className="faq-item">
              <h4>What areas do you cover?</h4>
              <p>We serve all major cities in Sri Lanka, with offices in Colombo, Kandy, and Galle.</p>
            </div>
            <div className="faq-item">
              <h4>Is your consultation free?</h4>
              <p>Yes, initial consultations are completely free with no obligation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
