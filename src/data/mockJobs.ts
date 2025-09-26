// Mock job data for cities across India
export const mockJobs = [
  // Mumbai
  {
    id: 'mock-1',
    user_id: 'mock-user-1',
    title: 'House Cleaning - Urgent Need',
    job_type: 'Household Work',
    daily_salary: '₹800/day',
    location: 'Bandra, Mumbai',
    description: 'Need someone for house cleaning. Daily work available. Experience preferred.',
    phone: '+91 98765 43210',
    urgency: 'urgent' as const,
    status: 'active' as const,
    featured: true,
    category: 'household-work',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-2',
    user_id: 'mock-user-2', 
    title: 'Food Delivery Partner',
    job_type: 'Delivery',
    daily_salary: '₹600-1000/day',
    location: 'Andheri, Mumbai',
    description: 'Food delivery partner needed. Own vehicle required. Flexible timings.',
    phone: '+91 98765 43211',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'delivery-transport',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-3',
    user_id: 'mock-user-3',
    title: 'Shop Assistant Required',
    job_type: 'Retail',
    daily_salary: '₹500/day',
    location: 'Dadar, Mumbai',
    description: 'Part-time shop assistant needed. Evening shifts available.',
    phone: '+91 98765 43212',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'shop-assistant',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },

  // Bangalore
  {
    id: 'mock-4',
    user_id: 'mock-user-4',
    title: 'Office Cleaning Staff',
    job_type: 'Household Work',
    daily_salary: '₹700/day',
    location: 'Koramangala, Bangalore',
    description: 'Office cleaning required daily. Morning shifts preferred.',
    phone: '+91 98765 43213',
    urgency: 'immediate' as const,
    status: 'active' as const,
    featured: true,
    category: 'household-work',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-5',
    user_id: 'mock-user-5',
    title: 'Bike Taxi Driver',
    job_type: 'Transport',
    daily_salary: '₹800-1200/day',
    location: 'Electronic City, Bangalore',
    description: 'Bike taxi driver needed. Own bike required. Full-time opportunity.',
    phone: '+91 98765 43214',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'delivery-transport',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-6',
    user_id: 'mock-user-6',
    title: 'Restaurant Helper',
    job_type: 'Food Service',
    daily_salary: '₹600/day',
    location: 'Indiranagar, Bangalore',
    description: 'Restaurant helper needed for kitchen work. Evening shift.',
    phone: '+91 98765 43215',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'hospitality',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },

  // Delhi
  {
    id: 'mock-7',
    user_id: 'mock-user-7',
    title: 'Construction Helper Required',
    job_type: 'Construction',
    daily_salary: '₹700/day',
    location: 'Gurgaon, Delhi',
    description: 'Construction helper needed for building work. Physical work required.',
    phone: '+91 98765 43216',
    urgency: 'urgent' as const,
    status: 'active' as const,
    featured: true,
    category: 'construction',
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-8',
    user_id: 'mock-user-8',
    title: 'Security Guard',
    job_type: 'Security',
    daily_salary: '₹650/day',
    location: 'Connaught Place, Delhi',
    description: 'Night shift security guard needed. Experience preferred.',
    phone: '+91 98765 43217',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'security',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },

  // Hyderabad
  {
    id: 'mock-9',
    user_id: 'mock-user-9',
    title: 'Shop Assistant - Part Time',
    job_type: 'Retail',
    daily_salary: '₹500/day',
    location: 'Hitech City, Hyderabad',
    description: 'Part-time shop assistant for electronics store. Evening shifts.',
    phone: '+91 98765 43218',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'shop-assistant',
    created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-10',
    user_id: 'mock-user-10',
    title: 'Home Tutor Needed',
    job_type: 'Education',
    daily_salary: '₹400/day',
    location: 'Begumpet, Hyderabad',
    description: 'Home tutor for class 10 student. Math and Science subjects.',
    phone: '+91 98765 43219',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'education',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  },

  // Chennai
  {
    id: 'mock-11',
    user_id: 'mock-user-11',
    title: 'House Maid Required',
    job_type: 'Household Work',
    daily_salary: '₹600/day',
    location: 'T. Nagar, Chennai',
    description: 'House maid required for daily cleaning and cooking. Morning hours.',
    phone: '+91 98765 43220',
    urgency: 'urgent' as const,
    status: 'active' as const,
    featured: true,
    category: 'household-work',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-12',
    user_id: 'mock-user-12',
    title: 'Auto Driver',
    job_type: 'Transport',
    daily_salary: '₹700-900/day',
    location: 'Anna Nagar, Chennai',
    description: 'Auto rickshaw driver needed. Own vehicle preferred.',
    phone: '+91 98765 43221',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'delivery-transport',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },

  // Pune
  {
    id: 'mock-13',
    user_id: 'mock-user-13',
    title: 'Warehouse Worker',
    job_type: 'Warehouse',
    daily_salary: '₹650/day',
    location: 'Pimpri-Chinchwad, Pune',
    description: 'Warehouse worker needed for packing and loading work.',
    phone: '+91 98765 43222',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'warehouse',
    created_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-14',
    user_id: 'mock-user-14',
    title: 'Cook Required',
    job_type: 'Household Work',
    daily_salary: '₹800/day',
    location: 'Koregaon Park, Pune',
    description: 'Experienced cook needed for home. North Indian cuisine preferred.',
    phone: '+91 98765 43223',
    urgency: 'immediate' as const,
    status: 'active' as const,
    featured: true,
    category: 'household-work',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },

  // Kolkata
  {
    id: 'mock-15',
    user_id: 'mock-user-15',
    title: 'Tea Stall Helper',
    job_type: 'Food Service',
    daily_salary: '₹400/day',
    location: 'Park Street, Kolkata',
    description: 'Tea stall helper needed. Morning and evening shifts available.',
    phone: '+91 98765 43224',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'hospitality',
    created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
  },

  // Ahmedabad
  {
    id: 'mock-16',
    user_id: 'mock-user-16',
    title: 'Garment Factory Worker',
    job_type: 'Manufacturing',
    daily_salary: '₹550/day',
    location: 'Narol, Ahmedabad',
    description: 'Garment factory worker needed. Sewing machine operation required.',
    phone: '+91 98765 43225',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'manufacturing',
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },

  // Jaipur
  {
    id: 'mock-17',
    user_id: 'mock-user-17',
    title: 'Handicraft Helper',
    job_type: 'Craft',
    daily_salary: '₹450/day',
    location: 'Pink City, Jaipur',
    description: 'Handicraft helper needed for traditional Rajasthani crafts.',
    phone: '+91 98765 43226',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'crafts',
    created_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  },

  // Kochi
  {
    id: 'mock-18',
    user_id: 'mock-user-18',
    title: 'Fish Market Helper',
    job_type: 'Market Work',
    daily_salary: '₹500/day',
    location: 'Marine Drive, Kochi',
    description: 'Fish market helper needed. Early morning work.',
    phone: '+91 98765 43227',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'market-work',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },

  // Indore
  {
    id: 'mock-19',
    user_id: 'mock-user-19',
    title: 'Street Food Vendor Helper',
    job_type: 'Food Service',
    daily_salary: '₹450/day',
    location: 'Sarafa Bazaar, Indore',
    description: 'Street food vendor helper needed. Evening shifts.',
    phone: '+91 98765 43228',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'hospitality',
    created_at: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString()
  },

  // Patna
  {
    id: 'mock-20',
    user_id: 'mock-user-20',
    title: 'Rickshaw Puller',
    job_type: 'Transport',
    daily_salary: '₹400-600/day',
    location: 'Gandhi Maidan, Patna',
    description: 'Cycle rickshaw puller needed. Own rickshaw preferred.',
    phone: '+91 98765 43229',
    urgency: 'normal' as const,
    status: 'active' as const,
    featured: false,
    category: 'delivery-transport',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  }
];