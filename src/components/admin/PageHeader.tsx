"use client";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
