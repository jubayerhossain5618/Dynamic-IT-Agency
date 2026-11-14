import React from 'react';
import {
  Megaphone,
  Code2,
  Layout,
  Server,
  Palette,
  Search,
  Globe,
  Layers,
} from 'lucide-react';

const ICON_MAP = {
  Megaphone,
  Code2,
  Layout,
  Server,
  Palette,
  Search,
  Globe,
  Layers,
};

const ServiceIcon = ({ name, className = 'w-6 h-6' }) => {
  const IconComponent = ICON_MAP[name] || Globe;
  return <IconComponent className={className} />;
};

export default ServiceIcon;
