import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { CATEGORIES, PRODUCTS, formatPrice } from '../data/storeProducts';
import './Store.css';

const CONTACT = {
  email: 'support@divsmall.com',
  phone: '+91 98765 43210',
  location: "Div's Mall, MG Road, Bengaluru, Karnataka 560001",
};

const EMPTY_SIGNUP = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  password: '',
  password2: '',
};

function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

export default function Store() {
  const { user, login, signup, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState(EMPTY_SIGNUP);
  const [toast, setToast] = useState('');
  const [logoOk, setLogoOk] = useState(true);
  const cartRef = useRef(null);

  useOnClickOutside(cartRef, () => setCartOpen(false), cartOpen);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description || '').toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const featuredProducts = useMemo(() => {
    const picks = ['w1', 'm1', 'b1', 'g1'];
    return picks
      .map((id) => PRODUCTS.find((product) => product.id === id))
      .filter(Boolean);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const addToCart = (product) => {
    if (!user) {
      setToast('Please login or create an account to add items to cart.');
      openAuth('login');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to cart`);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setAuthError('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!loginData.username.trim() || !loginData.password) {
      setAuthError('Please enter your username/email and password.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    try {
      await login(loginData.username.trim(), loginData.password);
      setAuthOpen(false);
      setLoginData({ username: '', password: '' });
      setToast('Signed in successfully');
    } catch (error) {
      setAuthError(error.message || 'Invalid username or password.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    const required = ['username', 'email', 'phone', 'password', 'password2'];
    for (const field of required) {
      if (!String(signupData[field] || '').trim()) {
        setAuthError('Please fill in all required fields (username, email, phone, password).');
        return;
      }
    }
    if (signupData.password !== signupData.password2) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    try {
      await signup({
        username: signupData.username.trim(),
        email: signupData.email.trim(),
        first_name: signupData.first_name.trim(),
        last_name: signupData.last_name.trim(),
        phone: signupData.phone.trim(),
        address: signupData.address.trim(),
        city: signupData.city.trim(),
        state: signupData.state.trim(),
        pincode: signupData.pincode.trim(),
        password: signupData.password,
        password2: signupData.password2,
      });
      setAuthOpen(false);
      setSignupData(EMPTY_SIGNUP);
      setToast('Account created and signed in successfully');
    } catch (error) {
      setAuthError(error.message || 'Unable to create account. Please check your details.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToast('Signed out');
  };

  const scrollToProducts = () => {
    document.getElementById('store-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (value.trim()) {
      document.getElementById('store-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeCategoryLabel =
    selectedCategory === 'all'
      ? 'All Categories'
      : CATEGORIES.find((category) => category.id === selectedCategory)?.label || 'Category';

  const updateSignup = (field) => (event) => {
    setSignupData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="store-page">
      <header className="store-nav">
        <div className="store-nav-inner">
          <a href="/" className="store-brand" aria-label="Div's Mall home">
            {logoOk ? (
              <img
                src="/logo.svg"
                alt="Div's Mall logo"
                className="store-logo"
                onError={() => setLogoOk(false)}
              />
            ) : null}
            <span className="store-logo-fallback" style={{ display: logoOk ? 'none' : 'inline-flex' }} aria-hidden={logoOk}>
              D
            </span>
            <span className="store-brand-text">Div&apos;s Mall</span>
          </a>

          <nav className="store-categories" aria-label="Product categories">
            <button
              type="button"
              className={`store-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`store-cat-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </nav>

          <div className="store-nav-actions">
            <label className="store-search" aria-label="Search dresses">
              <input
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search dresses..."
              />
            </label>

            <div className="store-cart-wrap" ref={cartRef}>
              <button
                type="button"
                className="store-icon-btn"
                onClick={() => setCartOpen((open) => !open)}
                aria-expanded={cartOpen}
                aria-label="Open cart"
              >
                Cart <span className="store-cart-badge">{cartCount}</span>
              </button>
              {cartOpen && (
                <div className="store-cart-panel" role="dialog" aria-label="Shopping cart">
                  <div className="store-cart-head">
                    <span>Your Cart</span>
                    <button type="button" className="store-modal-close" onClick={() => setCartOpen(false)} aria-label="Close cart">
                      ×
                    </button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="store-empty">Your cart is empty.</div>
                  ) : (
                    <>
                      <div className="store-cart-items">
                        {cart.map((item) => (
                          <div key={item.id} className="store-cart-item">
                            <img src={item.image} alt={item.name} />
                            <div>
                              <h4>{item.name}</h4>
                              <p>{formatPrice(item.price)} each</p>
                            </div>
                            <div className="store-cart-qty">
                              <button type="button" onClick={() => updateQty(item.id, -1)} aria-label={`Decrease ${item.name}`}>−</button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => updateQty(item.id, 1)} aria-label={`Increase ${item.name}`}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="store-cart-foot">
                        <span className="store-cart-total">Total: {formatPrice(cartTotal)}</span>
                        <button type="button" className="store-btn store-btn-dark" onClick={() => setToast('Checkout demo: cart ready')}>
                          Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="store-auth-area">
              {user ? (
                <>
                  <span className="store-user" title={user.username}>Hi, {user.first_name || user.username}</span>
                  <button type="button" className="store-icon-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button type="button" className="store-icon-btn" onClick={() => openAuth('login')}>
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="store-hero">
          <div className="store-hero-inner">
            <div className="store-hero-copy">
              <p className="store-hero-eyebrow">Div&apos;s Mall Clothing</p>
              <h1>Style that feels good, fabric that looks better.</h1>
              <p className="store-hero-text">
                Discover comfortable, well-crafted clothing for Women, Men, Boys, and Girls.
                From everyday essentials to standout outfits, find quality fabrics and timeless styles for every moment.
              </p>
              <div className="store-hero-actions">
                <button type="button" className="store-btn store-btn-primary" onClick={scrollToProducts}>
                  Shop Collection
                </button>
              </div>
            </div>
            <div className="store-hero-collage" aria-label="Featured clothing images">
              {featuredProducts.slice(0, 3).map((product) => (
                <img key={product.id} src={product.image} alt={product.name} loading="lazy" />
              ))}
            </div>
          </div>
        </section>

        <section className="store-section" aria-labelledby="featured-heading">
          <div className="store-section-head">
            <div>
              <h2 id="featured-heading">Popular Products</h2>
              <p>Handpicked styles from every category to get you started.</p>
            </div>
          </div>
          <div className="store-featured-strip">
            {featuredProducts.map((product) => (
              <article key={product.id} className="store-featured-card">
                <img src={product.image} alt={product.name} loading="lazy" />
                <div>
                  <h3>{product.name}</h3>
                  <span>{formatPrice(product.price)} · {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="store-section" id="store-products" aria-labelledby="products-heading">
          <div className="store-section-head">
            <div>
              <h2 id="products-heading">{activeCategoryLabel}</h2>
            </div>
          </div>

          <div className="store-results-note">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            {search.trim() ? ` for “${search.trim()}”` : ''}.
          </div>

          {filteredProducts.length === 0 ? (
            <div className="store-no-results">
              No dresses found. Try a different search or category.
            </div>
          ) : (
            <div className="store-grid">
              {filteredProducts.map((product) => {
                const inCart = cart.some((item) => item.id === product.id);
                return (
                  <article key={product.id} className="store-product">
                    <img className="store-product-img" src={product.image} alt={product.name} loading="lazy" />
                    <div className="store-product-body">
                      <span className="store-product-cat">{product.category}</span>
                      <h3>{product.name}</h3>
                      {product.description ? (
                        <p className="store-product-desc">{product.description}</p>
                      ) : null}
                      <div className="store-product-bottom">
                        <span className="store-price">{formatPrice(product.price)}</span>
                        <button
                          type="button"
                          className={`store-add-btn ${inCart ? 'added' : ''}`}
                          onClick={() => addToCart(product)}
                        >
                          {inCart ? 'Add More' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="store-footer">
        <div className="store-footer-inner">
          <div>
            <h3>Div&apos;s Mall</h3>
            <p>
              Your destination for elegant fashion across Women, Men, Boy, and Girl collections.
              Designed in a timeless grey, black, and white palette.
            </p>
          </div>
          <div>
            <h4>Categories</h4>
            <ul className="store-contact-list">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a href="#store-products" onClick={(e) => { e.preventDefault(); setSelectedCategory(category.id); scrollToProducts(); }}>
                    {category.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <ul className="store-contact-list">
              <li>
                Email:{' '}
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                Phone:{' '}
                <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}>{CONTACT.phone}</a>
              </li>
              <li>
                Location:{' '}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.location)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {CONTACT.location}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="store-footer-bottom">
          © {new Date().getFullYear()} Div&apos;s Mall. All rights reserved.
        </div>
      </footer>

      {authOpen && !user && (
        <div className="store-modal-backdrop" role="presentation" onClick={closeAuth}>
          <div
            className={`store-modal ${authMode === 'signup' ? 'store-modal-wide' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={authMode === 'login' ? 'Login' : 'Create account'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="store-modal-head">
              <div>
                <h3>{authMode === 'login' ? 'Login to Div\'s Mall' : 'Create your account'}</h3>
                <p className="store-modal-sub">
                  {authMode === 'login'
                    ? 'Sign in with your username/email and password.'
                    : 'First-time user? Register with your details to get started.'}
                </p>
              </div>
              <button type="button" className="store-modal-close" onClick={closeAuth} aria-label="Close">
                ×
              </button>
            </div>

            <div className="store-auth-tabs" role="tablist" aria-label="Authentication options">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                className={`store-auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'signup'}
                className={`store-auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              >
                Sign Up
              </button>
            </div>

            {authMode === 'login' ? (
              <form className="store-modal-body" onSubmit={handleLogin}>
                {authError ? <div className="store-alert">{authError}</div> : null}
                <label className="store-field">
                  <span>Username or Email</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={loginData.username}
                    onChange={(event) => setLoginData((prev) => ({ ...prev, username: event.target.value }))}
                    placeholder="Enter username or email"
                  />
                </label>
                <label className="store-field">
                  <span>Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(event) => setLoginData((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Enter password"
                  />
                </label>
                <button type="submit" className="store-btn store-btn-dark" disabled={authBusy}>
                  {authBusy ? 'Signing in…' : 'Login'}
                </button>
                <p className="store-auth-switch">
                  New here?{' '}
                  <button type="button" className="store-inline-link" onClick={() => { setAuthMode('signup'); setAuthError(''); }}>
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form className="store-modal-body" onSubmit={handleSignup}>
                {authError ? <div className="store-alert">{authError}</div> : null}

                <div className="store-form-grid">
                  <label className="store-field">
                    <span>Username *</span>
                    <input type="text" autoComplete="username" value={signupData.username} onChange={updateSignup('username')} placeholder="Choose a username" />
                  </label>
                  <label className="store-field">
                    <span>Email *</span>
                    <input type="email" autoComplete="email" value={signupData.email} onChange={updateSignup('email')} placeholder="you@example.com" />
                  </label>
                  <label className="store-field">
                    <span>First Name</span>
                    <input type="text" autoComplete="given-name" value={signupData.first_name} onChange={updateSignup('first_name')} placeholder="First name" />
                  </label>
                  <label className="store-field">
                    <span>Last Name</span>
                    <input type="text" autoComplete="family-name" value={signupData.last_name} onChange={updateSignup('last_name')} placeholder="Last name" />
                  </label>
                  <label className="store-field store-field-full">
                    <span>Phone Number *</span>
                    <input type="tel" autoComplete="tel" value={signupData.phone} onChange={updateSignup('phone')} placeholder="e.g. +91 98765 43210" />
                  </label>
                  <label className="store-field store-field-full">
                    <span>Address</span>
                    <input type="text" autoComplete="street-address" value={signupData.address} onChange={updateSignup('address')} placeholder="House no., street, area" />
                  </label>
                  <label className="store-field">
                    <span>City</span>
                    <input type="text" autoComplete="address-level2" value={signupData.city} onChange={updateSignup('city')} placeholder="City" />
                  </label>
                  <label className="store-field">
                    <span>State</span>
                    <input type="text" autoComplete="address-level1" value={signupData.state} onChange={updateSignup('state')} placeholder="State" />
                  </label>
                  <label className="store-field">
                    <span>Pincode</span>
                    <input type="text" autoComplete="postal-code" value={signupData.pincode} onChange={updateSignup('pincode')} placeholder="e.g. 560001" />
                  </label>
                  <div className="store-field" aria-hidden="true" />
                  <label className="store-field">
                    <span>Password *</span>
                    <input type="password" autoComplete="new-password" value={signupData.password} onChange={updateSignup('password')} placeholder="Create a password" />
                  </label>
                  <label className="store-field">
                    <span>Confirm Password *</span>
                    <input type="password" autoComplete="new-password" value={signupData.password2} onChange={updateSignup('password2')} placeholder="Confirm password" />
                  </label>
                </div>

                <button type="submit" className="store-btn store-btn-dark" disabled={authBusy}>
                  {authBusy ? 'Creating account…' : 'Create Account'}
                </button>
                <p className="store-auth-switch">
                  Already have an account?{' '}
                  <button type="button" className="store-inline-link" onClick={() => { setAuthMode('login'); setAuthError(''); }}>
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {toast ? <div className="store-toast" role="status">{toast}</div> : null}
    </div>
  );
}
