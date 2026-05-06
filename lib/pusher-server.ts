import PusherServer from 'pusher';

const pusherConfig = {
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
};

const isPusherConfigured = !(
  !process.env.PUSHER_APP_ID ||
  !process.env.NEXT_PUBLIC_PUSHER_KEY ||
  !process.env.PUSHER_SECRET
);

let pusherInstance: PusherServer | null = null;

const getPusherInstance = () => {
  if (!isPusherConfigured) {
    return null;
  }
  if (!pusherInstance) {
    pusherInstance = new PusherServer(pusherConfig);
  }
  return pusherInstance;
};

// Proxy object that handles unconfigured state gracefully
export const pusherServer = new Proxy({} as PusherServer, {
  get(_, prop) {
    const instance = getPusherInstance();
    if (!instance) {
      return async () => {
        console.warn(`Pusher not configured. Call to ${String(prop)} ignored.`);
        return prop === 'trigger' ? Promise.resolve() : null;
      };
    }
    return Reflect.get(instance, prop);
  },
});
