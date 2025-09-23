import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

const BreadcrumbNavigation = ({ items, className }: BreadcrumbNavigationProps) => {
  return (
    <nav className={`py-4 ${className}`} aria-label="Breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center hover:text-brand">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {items.length > 0 && <BreadcrumbSeparator />}
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.url && index < items.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.url} className="hover:text-brand">
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-foreground font-medium">
                    {item.name}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};

export default BreadcrumbNavigation;