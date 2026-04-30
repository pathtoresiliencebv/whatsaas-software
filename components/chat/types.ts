export type Message = {
  id: string;
  key?: {
    id: string;
    remote: string;
    fromMe: boolean;
  };
  message?: any;
  messageType: string;
  timestamp: number | string;
  mediaUrl?: string | null;
  text?: string | null;
  mediaCaption?: string | null;
  chatId?: number;
  fromMe?: boolean;
  status?: string;
  errorMessage?: string;
  quotedMessageId?: string;
  quotedMessageText?: string | null;
  isInternal?: boolean;
  isAi?: boolean;
  isAutomation?: boolean;
  mediaMimetype?: string | null;
  reactions?: Reaction[];
  [key: string]: any;
};

export type Reaction = {
  id?: number;
  key?: string;
  reaction?: string;
  emoji?: string;
  fromMe?: boolean;
  remoteJid?: string | null;
  participantName?: string | null;
  [key: string]: any;
};

export type QuickReply = {
  id: number;
  shortcut: string;
  message: string;
};

export type NewMessagePayload = {
  id?: string;
  key: {
    id: string;
    remote: string;
    fromMe: boolean;
  };
  message: any;
  messageType: string;
  timestamp: number;
  pushName?: string;
  remoteJid?: string;
  instanceId?: number;
  status?: string;
  fromMe?: boolean;
  [key: string]: any;
};

export type ChatDetails = {
  key?: {
    id: string;
    remote: string;
    fromMe: boolean;
  };
  remoteJid?: string | null;
  name?: string;
  profilePicUrl?: string | null;
  lastCustomerInteraction?: string | null;
  integration?: string;
  contact?: {
    id: number;
    name?: string;
    pushName?: string;
  };
  [key: string]: any;
};

export type ContactData = {
  id: number;
  name?: string;
  pushName?: string;
  [key: string]: any;
};

export type TeamData = {
  id: number;
  name: string;
  [key: string]: any;
};

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped' | 'review' | 'sending';

export type UserData = {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
};
