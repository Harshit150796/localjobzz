
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  count: string;
  href: string;
  gradient: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, subtitle, icon: Icon, count, href, gradient }) => {
  return (
    <Link to={href} className="group">
      <div className={`relative overflow-hidden rounded-xl ${gradient} p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 text-white" />
          <span className="text-white/80 text-sm font-medium">{count}</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{subtitle}</p>
        
        {/* Decorative element */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10"></div>
      </div>
    </Link>
  );
};

export default CategoryCard;
