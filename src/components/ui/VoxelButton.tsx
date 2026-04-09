import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function VoxelButton({ children, variant = 'primary', className = '', ...props }: Props) {
  const baseStyles = "relative inline-block px-4 py-2 font-bold text-sm uppercase tracking-wider transition-all duration-75 active:translate-y-1 active:shadow-none focus:outline-none";
  
  const variants = {
    primary: "bg-[#4cc9f0] text-white shadow-[0_4px_0_0_#4361ee] hover:bg-[#4895ef]",
    secondary: "bg-[#7209b7] text-white shadow-[0_4px_0_0_#560bad] hover:bg-[#b517ad]",
    danger: "bg-[#f72585] text-white shadow-[0_4px_0_0_#b517ad] hover:bg-[#ff006e]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% - 0 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))",
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
