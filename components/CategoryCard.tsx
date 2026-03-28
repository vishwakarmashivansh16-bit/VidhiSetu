import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, icon: Icon, color, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card-legal p-8 cursor-pointer group flex flex-col h-full"
      onClick={onClick}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-text-muted text-sm leading-relaxed mb-8 flex-grow">
        {description}
      </p>
      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
        Explore Topics
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};
