import { Home, Truck, Hammer, ShoppingCart, Shield, FileText, LucideIcon } from 'lucide-react';

export const jobCategories = [
  {
    id: 'household-work',
    title: 'Household Work',
    subtitle: 'Cleaning, Cooking, Gardening',
    count: '500+ jobs today',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    keywords: 'household work, cleaning jobs, cooking jobs, gardening, domestic help, maid jobs',
    icon: Home
  },
  {
    id: 'delivery-transport',
    title: 'Delivery & Transport',
    subtitle: 'Food Delivery, Package, Driving',
    count: '300+ jobs today',
    gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    keywords: 'delivery jobs, transport jobs, driver jobs, food delivery, package delivery',
    icon: Truck
  },
  {
    id: 'construction',
    title: 'Construction',
    subtitle: 'Labour, Painting, Plumbing',
    count: '200+ jobs today',
    gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
    keywords: 'construction jobs, labor jobs, painting jobs, plumbing, electrician, carpenter',
    icon: Hammer
  },
  {
    id: 'shop-assistant',
    title: 'Shop Assistant',
    subtitle: 'Sales, Cashier, Helper',
    count: '150+ jobs today',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    keywords: 'shop assistant, retail jobs, cashier jobs, sales jobs, customer service',
    icon: ShoppingCart
  },
  {
    id: 'security',
    title: 'Security',
    subtitle: 'Guard, Watchman, Security',
    count: '100+ jobs today',
    gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
    keywords: 'security jobs, guard jobs, watchman, night shift security',
    icon: Shield
  },
  {
    id: 'office-work',
    title: 'Office Work',
    subtitle: 'Data Entry, Filing, Assistant',
    count: '120+ jobs today',
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    keywords: 'office jobs, data entry, filing, office assistant, administrative work',
    icon: FileText
  }
];

export interface JobCategory {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  gradient: string;
  keywords: string;
  icon: LucideIcon;
}

export const useJobCategories = () => {
  return {
    categories: jobCategories,
    getCategoryById: (id: string) => jobCategories.find(cat => cat.id === id),
    getCategoryByTitle: (title: string) => jobCategories.find(cat => 
      cat.title.toLowerCase().replace(/\s+/g, '-') === title.toLowerCase()
    )
  };
};