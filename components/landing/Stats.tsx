'use client';

import { MessageSquare, Users, Zap, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: MessageSquare,
    value: '1M+',
    label: 'Messages Processed',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Active Businesses',
  },
  {
    icon: Zap,
    value: '40%',
    label: 'Faster Response Time',
  },
  {
    icon: TrendingUp,
    value: '3x',
    label: 'More Leads',
  },
];

export function Stats() {
  return (
    <section className="py-16 bg-primary/5 border-y border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
