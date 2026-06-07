export type Chat = {
  id: string;
  name: string;
  initials: string;
  kind: 'Lead' | 'Customer' | 'Group';
  stage: string;
  lastMessage: string;
  time: string;
  unread: number;
  phone: string;
  owner: string;
  status: string;
  temperature: 'Hot' | 'Warm' | 'Calm';
};

export const chats: Chat[] = [
  {
    id: 'pure-skin',
    name: 'Pure Skin Studio by Siham',
    initials: 'PS',
    kind: 'Group',
    stage: 'Niet toegewezen',
    lastMessage: 'Kun je de offerte en voorbeeldflow vandaag sturen?',
    time: '16:58',
    unread: 4,
    phone: '+31 6 42 18 77 21',
    owner: 'Nina',
    status: 'AI paused',
    temperature: 'Hot',
  },
  {
    id: 'sens-marketing',
    name: 'SENS x RMCO x Venius',
    initials: 'SE',
    kind: 'Group',
    stage: 'New',
    lastMessage: 'De import is klaar. Alleen media mist nog in het overzicht.',
    time: '15:21',
    unread: 2,
    phone: '+31 6 31 62 76 95',
    owner: 'Jason',
    status: 'Needs review',
    temperature: 'Warm',
  },
  {
    id: 'kevin',
    name: 'Kevin',
    initials: 'KE',
    kind: 'Lead',
    stage: 'Negotiation',
    lastMessage: 'Jaa toch is goed. Plan maar een belletje.',
    time: '14:09',
    unread: 0,
    phone: '+31 6 31 16 97 77',
    owner: 'Mila',
    status: 'Human active',
    temperature: 'Hot',
  },
  {
    id: 'vinay',
    name: 'Vinay',
    initials: 'VI',
    kind: 'Customer',
    stage: 'Won',
    lastMessage: 'Geen probleem. Ben Nina thuis, uitleg voor web app.',
    time: '10:14',
    unread: 0,
    phone: '+31 6 36 27 69 53',
    owner: 'Nina',
    status: 'Synced',
    temperature: 'Calm',
  },
];

export const messages = [
  { id: 'm1', from: 'them', body: 'Maatje', time: '27-05 10:06' },
  { id: 'm2', from: 'them', body: 'Jij onderweg?', time: '27-05 10:06' },
  { id: 'm3', from: 'me', body: 'Jas maat', time: '27-05 10:14' },
  { id: 'm4', from: 'them', body: 'Thanks voor vandaag', time: '27-05 14:45' },
  { id: 'm5', from: 'me', body: 'Geen probleem', time: '27-05 15:29' },
  { id: 'm6', from: 'me', body: 'Ben Nina thuis', time: '27-05 15:29' },
  { id: 'm7', from: 'me', body: 'uitleg voor web app', time: '27-05 15:29' },
  { id: 'm8', from: 'them', body: 'Jaa top', time: '28-05 14:09' },
];

export const pipelineStages = [
  { title: 'Niet toegewezen', count: 49, value: 'EUR 18.4k', chats: ['Pure Skin Studio by Siham', 'SENS x RMCO x Venius'] },
  { title: 'New', count: 12, value: 'EUR 9.8k', chats: ['Pilot sens', 'KH X CRM systeem'] },
  { title: 'Negotiation', count: 5, value: 'EUR 21.6k', chats: ['Kevin', 'Communicatie Sens'] },
  { title: 'Won', count: 8, value: 'EUR 36.2k', chats: ['Vinay', 'Venius B.V.'] },
];
