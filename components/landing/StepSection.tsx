'use client';

import React from 'react';

type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  { number: '01', title: 'Connect WhatsApp', description: 'Link your WhatsApp number using QR code or phone pairing.' },
  { number: '02', title: 'Import Contacts', description: 'Add contacts manually or import from CSV/Excel files.' },
  { number: '03', title: 'Create Automation', description: 'Build AI-powered flows or chatbot rules to handle messages.' },
  { number: '04', title: 'Start Sending', description: 'Send campaigns, automate responses, and manage conversations.' },
];

export function StepSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Get Started in Minutes</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
