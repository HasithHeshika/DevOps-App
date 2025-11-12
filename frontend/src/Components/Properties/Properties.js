import React, { useState, useEffect } from 'react';
import '../../Styles/Properties.css';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: 'any'
  });

  // Sample property data - will be replaced with API call
  const sampleProperties = [
    {
      _id: '1',
      title: 'Modern Villa in Colombo',
      description: 'Luxurious modern villa with ocean view, spacious rooms, and premium amenities.',
      price: 25000000,
      location: 'Colombo 07',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 3500,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
      features: ['Swimming Pool', 'Parking', 'Garden', 'Security'],
      status: 'For Sale'
    },
    {
      _id: '2',
      title: 'Commercial Land - Galle Road',
      description: 'Prime commercial land on Galle Road, ideal for business development.',
      price: 15000000,
      location: 'Galle Road, Colombo',
      type: 'Commercial',
      area: 5000,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
      features: ['Main Road Access', 'High Visibility', 'Commercial Zone'],
      status: 'For Sale'
    },
    {
      _id: '3',
      title: 'Luxury Apartment - Mount Lavinia',
      description: 'Beautiful beachfront apartment with stunning sea views and modern design.',
      price: 8500000,
      location: 'Mount Lavinia',
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
      features: ['Sea View', 'Gym', 'Parking', 'Security'],
      status: 'For Sale'
    },
    {
      _id: '4',
      title: 'Residential Land - Negombo',
      description: 'Peaceful residential land perfect for building your dream home.',
      price: 4500000,
      location: 'Negombo',
      type: 'Residential',
      area: 2000,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
      features: ['Quiet Area', 'Good Access', 'Water & Electricity'],
      status: 'For Sale'
    },
    {
      _id: '5',
      title: 'Modern Townhouse',
      description: 'Contemporary townhouse in gated community with all modern amenities.',
      price: 12000000,
      location: 'Rajagiriya',
      type: 'Townhouse',
      bedrooms: 3,
      bathrooms: 2,
      area: 2200,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
      features: ['Gated Community', 'Parking', 'Garden', 'Security'],
      status: 'For Sale'
    },
    {
      _id: '6',
      title: 'Office Space - Colombo 03',
      description: 'Prime office space in commercial district, fully furnished.',
      price: 18000000,
      location: 'Colombo 03',
      type: 'Commercial',
      area: 3000,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
      features: ['Furnished', 'Parking', 'Central AC', 'High Speed Internet'],
      status: 'For Rent'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProperties(sampleProperties);
      setFilteredProperties(sampleProperties);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    filterProperties();
  }, [filters, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(prop => 
        prop.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(prop =>
        prop.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(prop => prop.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(prop => prop.price <= parseInt(filters.maxPrice));
    }

    // Filter by bedrooms
    if (filters.bedrooms !== 'any') {
      filtered = filtered.filter(prop => 
        prop.bedrooms && prop.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'any'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="properties-page">
      <div className="properties-hero">
        <div className="container">
          <h1>Find Your Perfect Property</h1>
          <p>Browse through our extensive collection of premium properties</p>
        </div>
      </div>

      <div className="container properties-container">
        {/* Filter Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filter Properties</h3>
            <button onClick={resetFilters} className="reset-btn">Reset</button>
          </div>

          <div className="filter-group">
            <label>Property Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="all">All Types</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential Land</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Enter location"
            />
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min (LKR)"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max (LKR)"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Bedrooms</label>
            <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
              <option value="any">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </aside>

        {/* Properties Grid */}
        <div className="properties-content">
          <div className="properties-header">
            <h2>Available Properties ({filteredProperties.length})</h2>
            <div className="sort-options">
              <label>Sort by:</label>
              <select>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Area: Largest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="no-results">
              <h3>No Properties Found</h3>
              <p>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map(property => (
                <div key={property._id} className="property-card">
                  <div className="property-image">
                    <img src={property.image} alt={property.title} />
                    <div className="property-badges">
                      <span className="badge type-badge">{property.type}</span>
                      <span className="badge status-badge">{property.status}</span>
                    </div>
                  </div>

                  <div className="property-content">
                    <h3>{property.title}</h3>
                    <p className="property-location">📍 {property.location}</p>
                    <p className="property-description">{property.description}</p>

                    <div className="property-details">
                      {property.bedrooms && (
                        <span>🛏️ {property.bedrooms} Beds</span>
                      )}
                      {property.bathrooms && (
                        <span>🚿 {property.bathrooms} Baths</span>
                      )}
                      <span>📐 {property.area} sq ft</span>
                    </div>

                    <div className="property-features">
                      {property.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>

                    <div className="property-footer">
                      <span className="property-price">{formatPrice(property.price)}</span>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
