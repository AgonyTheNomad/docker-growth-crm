// components/ui/card.jsx
import React from 'react';

const Card = ({ className = '', ...props }) => (
  <div className={`rounded-lg border border-slate-700 bg-slate-800 text-slate-50 shadow ${className}`} {...props} />
);

const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />
);

const CardContent = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };