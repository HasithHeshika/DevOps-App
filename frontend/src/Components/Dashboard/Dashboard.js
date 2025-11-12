import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Fetch user data from API
      fetchUserData(token);
    }
  }, [navigate]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Token invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Sample data - will be replaced with API calls
  const savedProperties = [
    {
      id: 1,
      title: 'Modern Villa in Colombo',
      price: 'LKR 25,000,000',
      location: 'Colombo 07',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop',
      savedDate: '2024-11-10'
    },
    {
      id: 2,
      title: 'Luxury Apartment',
      price: 'LKR 8,500,000',
      location: 'Mount Lavinia',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop',
      savedDate: '2024-11-08'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Saved Property',
      property: 'Modern Villa in Colombo',
      date: '2024-11-10',
      time: '10:30 AM'
    },
    {
      id: 2,
      action: 'Viewed Property',
      property: 'Commercial Land - Galle Road',
      date: '2024-11-09',
      time: '3:45 PM'
    },
    {
      id: 3,
      action: 'Updated Profile',
      property: 'Account Settings',
      date: '2024-11-08',
      time: '2:15 PM'
    }
  ];

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile">
            <div className="user-avatar">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <h3>{user.firstName} {user.lastName}</h3>
            <p className="user-email">{user.email}</p>
          </div>

          <nav className="dashboard-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <span className="nav-icon">❤️</span>
              Saved Properties
            </button>
            <button
              className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="nav-icon">📝</span>
              Activity
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              Profile Settings
            </button>
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard-section">
              <h1>Welcome back, {user.firstName}!</h1>
              <p className="section-subtitle">Here's what's happening with your account</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-info">
                    <h3>{savedProperties.length}</h3>
                    <p>Saved Properties</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-info">
                    <h3>12</h3>
                    <p>Properties Viewed</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔔</div>
                  <div className="stat-info">
                    <h3>3</h3>
                    <p>New Alerts</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📞</div>
                  <div className="stat-info">
                    <h3>5</h3>
                    <p>Inquiries Made</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => navigate('/properties')}>
                    <span className="action-icon">🔍</span>
                    <span className="action-text">Browse Properties</span>
                  </button>
                  <button className="action-card">
                    <span className="action-icon">📧</span>
                    <span className="action-text">Contact Agent</span>
                  </button>
                  <button className="action-card">
                    <span className="action-icon">💰</span>
                    <span className="action-text">Get Valuation</span>
                  </button>
                  <button className="action-card">
                    <span className="action-icon">📅</span>
                    <span className="action-text">Schedule Viewing</span>
                  </button>
                </div>
              </div>

              <div className="recent-section">
                <h2>Recently Viewed</h2>
                <div className="property-list">
                  {savedProperties.slice(0, 2).map(property => (
                    <div key={property.id} className="property-item">
                      <img src={property.image} alt={property.title} />
                      <div className="property-info">
                        <h4>{property.title}</h4>
                        <p className="property-location">📍 {property.location}</p>
                        <p className="property-price">{property.price}</p>
                      </div>
                      <button className="view-btn">View Details</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Saved Properties Tab */}
          {activeTab === 'saved' && (
            <div className="dashboard-section">
              <h1>Saved Properties</h1>
              <p className="section-subtitle">Properties you've bookmarked for later</p>

              <div className="property-grid">
                {savedProperties.map(property => (
                  <div key={property.id} className="property-card-dash">
                    <img src={property.image} alt={property.title} />
                    <div className="property-content">
                      <h3>{property.title}</h3>
                      <p className="property-location">📍 {property.location}</p>
                      <p className="property-price">{property.price}</p>
                      <p className="saved-date">Saved on {property.savedDate}</p>
                      <div className="property-actions">
                        <button className="btn-primary">View Details</button>
                        <button className="btn-secondary">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="dashboard-section">
              <h1>Recent Activity</h1>
              <p className="section-subtitle">Your recent actions and interactions</p>

              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">📌</div>
                    <div className="activity-info">
                      <h4>{activity.action}</h4>
                      <p>{activity.property}</p>
                      <span className="activity-time">{activity.date} at {activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="dashboard-section">
              <h1>Profile Settings</h1>
              <p className="section-subtitle">Manage your account information</p>

              <div className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" defaultValue={user.firstName} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" defaultValue={user.lastName} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" defaultValue={user.email} disabled />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" defaultValue={user.phone} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Account Type</h3>
                  <p className="account-type-badge">{user.userType || 'Buyer'}</p>
                </div>

                <div className="form-actions">
                  <button className="save-btn">Save Changes</button>
                  <button className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
