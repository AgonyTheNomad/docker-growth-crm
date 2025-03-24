// components/ui/tabs.jsx
import React from 'react';

const Tabs = ({ value, onValueChange, className = '', children }) => (
  <div className={`w-full ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
);

const TabsList = ({ className = '', children }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-700 p-1 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, onClick, className = '', active }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
    ${active ? 'bg-slate-600 text-slate-100' : 'text-slate-400 hover:text-slate-100'} ${className}`}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
);

export { Tabs, TabsList, TabsTrigger };