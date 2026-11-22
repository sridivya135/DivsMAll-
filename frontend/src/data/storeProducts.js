const svgImage = (label, accent = '#4b5563') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="24" y="24" width="352" height="360" rx="18" fill="#e5e7eb"/>
      <path d="M140 120h120l40 40v170c0 22-18 40-40 40h-120c-22 0-40-18-40-40V160l40-40z" fill="${accent}" opacity="0.18"/>
      <path d="M165 150c10 22 25 34 35 34s25-12 35-34" fill="none" stroke="#111827" stroke-width="10" stroke-linecap="round"/>
      <path d="M140 120l-28 34 28 24 20-34M260 120l28 34-28 24-20-34" fill="none" stroke="#374151" stroke-width="10" stroke-linejoin="round"/>
      <rect x="150" y="210" width="100" height="120" rx="18" fill="#111827" opacity="0.08"/>
      <text x="200" y="432" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${label}</text>
      <text x="200" y="468" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">Div's Mall Collection</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const CATEGORIES = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'boy', label: 'Boy' },
  { id: 'girl', label: 'Girl' },
];

export const PRODUCTS = [
  // Women
  {
    id: 'w1',
    category: 'women',
    name: 'Elegant Everyday Dress',
    price: 1899,
    image: import.meta.env.BASE_URL + 'products/women/women-dress-1.jpeg',
    description: 'A graceful everyday dress with a flattering silhouette, perfect for outings and casual occasions.',
  },
  {
    id: 'w2',
    category: 'women',
    name: 'Chic Linen Pants Outfit',
    price: 2199,
    image: import.meta.env.BASE_URL + 'products/women/linen-pants-outfit.jpeg',
    description: 'Effortlessly chic linen pants outfit with a breathable, lightweight feelâ€”ideal for summer styling.',
  },
  {
    id: 'w3',
    category: 'women',
    name: 'Trendy Casual Outfit',
    price: 1599,
    image: import.meta.env.BASE_URL + 'products/women/shein-outfit.jpeg',
    description: 'A modern, stylish casual outfit that pairs comfort with a trendy look for day-to-day wear.',
  },
  {
    id: 'w4',
    category: 'women',
    name: 'Classic Cotton Kurti',
    price: 1299,
    image: import.meta.env.BASE_URL + 'products/women/cotton-kurti.jpeg',
    description: 'Soft and breathable cotton kurti designed for all-day comfort, perfect for daily and festive wear.',
  },
  {
    id: 'w5',
    category: 'women',
    name: 'Elegant Puff Sleeve Striped Blouse',
    price: 1499,
    image: import.meta.env.BASE_URL + 'products/women/elegant-puff-sleeve-blouse.jpeg',
    description: 'Elegant short-sleeve striped blouse with puff sleeves and a tailored fit for a polished, feminine look.',
  },

  // Men
  {
    id: 'm1',
    category: 'men',
    name: 'Spider Print Casual Hoodie',
    price: 1799,
    image: import.meta.env.BASE_URL + 'products/men/spider-print-hoodie.jpeg',
    description: 'Casual long-sleeve hoodie with a bold spider printâ€”comfortable, warm, and great for everyday wear.',
  },
  {
    id: 'm2',
    category: 'men',
    name: 'Chocolate Relaxed Fit Cargo Trousers',
    price: 1999,
    image: import.meta.env.BASE_URL + 'products/men/chocolate-cargo-trouser.jpeg',
    description: 'Relaxed-fit cargo trousers in a rich chocolate tone, featuring practical pockets and all-day comfort.',
  },
  {
    id: 'm3',
    category: 'men',
    name: 'Classic Men\'s Casual Outfit',
    price: 1699,
    image: import.meta.env.BASE_URL + 'products/men/men-outfit-1.jpeg',
    description: 'A stylish casual outfit with a clean, modern lookâ€”easy to pair for daily wear and outings.',
  },
  {
    id: 'm4',
    category: 'men',
    name: 'Smart Men\'s Fashion Outfit',
    price: 1899,
    image: import.meta.env.BASE_URL + 'products/men/men-outfit-2.jpeg',
    description: 'A smart, contemporary men\'s outfit designed for comfort and a sharp everyday appearance.',
  },
  {
    id: 'm5',
    category: 'men',
    name: 'Ripped Denim Jacket',
    price: 2499,
    image: import.meta.env.BASE_URL + 'products/men/ripped-denim-jacket.jpeg',
    description: 'Men\'s flap-pocket ripped denim jacket with a rugged finishâ€”perfect for layering and street-style looks.',
  },

  // Boy
  {
    id: 'b1',
    category: 'boy',
    name: 'Boden Kids Classic Outfit',
    price: 1299,
    image: import.meta.env.BASE_URL + 'products/boy/boden-kids-outfit.jpeg',
    description: 'A classic, well-finished kids outfit with a smart and comfortable look for everyday wear and outings.',
  },
  {
    id: 'b2',
    category: 'boy',
    name: 'Brown Raglan T-Shirt',
    price: 899,
    image: import.meta.env.BASE_URL + 'products/boy/brown-raglan-tshirt.jpeg',
    description: 'Minimalist regular-fit brown raglan T-shirt with a sporty contrast styleâ€”easy to pair and comfortable.',
  },
  {
    id: 'b3',
    category: 'boy',
    name: 'Trendy Boy\'s Casual Outfit',
    price: 1099,
    image: import.meta.env.BASE_URL + 'products/boy/shein-boy-outfit.jpeg',
    description: 'A trendy casual outfit for boys with a modern look, perfect for daily wear and casual occasions.',
  },
  {
    id: 'b4',
    category: 'boy',
    name: 'Surf Style Sport Outfit',
    price: 1199,
    image: import.meta.env.BASE_URL + 'products/boy/surf-sport-outfit.jpeg',
    description: 'Sporty surf-inspired outfit with a cool, active vibeâ€”great for playtime and outdoor fun.',
  },
  {
    id: 'b5',
    category: 'boy',
    name: 'Cute Everyday Boy Outfit',
    price: 999,
    image: import.meta.env.BASE_URL + 'products/boy/cute-boy-outfit.jpeg',
    description: 'An adorable and comfy everyday outfit for boys, designed for a cute look with all-day ease.',
  },

  // Girl
  {
    id: 'g1',
    category: 'girl',
    name: 'Letter Print Sweatshirt & Pleated Skirt Set',
    price: 1399,
    image: import.meta.env.BASE_URL + 'products/girl/sweatshirt-skirt-set.jpeg',
    description: 'Cute crew-neck letter print sweatshirt paired with a pleated skirtâ€”comfortable, stylish, and perfect for everyday wear.',
  },
  {
    id: 'g2',
    category: 'girl',
    name: 'Cozy Pink & White Sweater',
    price: 1199,
    image: import.meta.env.BASE_URL + 'products/girl/cozy-pink-white-sweater.jpeg',
    description: 'A cozy pink and white sweater with a soft, warm feelâ€”ideal for layering on cooler days.',
  },
  {
    id: 'g3',
    category: 'girl',
    name: 'Trendy Girl\'s Outfit',
    price: 1299,
    image: import.meta.env.BASE_URL + 'products/girl/girl-outfit-1.jpeg',
    description: 'A trendy and comfortable outfit for girls with a charming look, great for outings and daily wear.',
  },
  {
    id: 'g4',
    category: 'girl',
    name: 'Stylish Girl\'s Outfit',
    price: 1249,
    image: import.meta.env.BASE_URL + 'products/girl/girl-outfit-2.jpeg',
    description: 'A stylish, easy-to-wear outfit designed for comfort and a cute, modern appearance.',
  },
  {
    id: 'g5',
    category: 'girl',
    name: 'Stylish Bottoms Collection',
    price: 999,
    image: import.meta.env.BASE_URL + 'products/girl/stylish-bottoms.jpeg',
    description: 'Versatile and comfortable bottoms that pair easily with tops for a complete, fashionable look.',
  },
];

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
