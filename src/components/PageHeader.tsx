import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
};
