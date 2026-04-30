// Twilio client stub - plugin not enabled
export function createTwilioClient(config?: any) {
  // Return a mock client structure for TypeScript compatibility
  // The actual API routes check plugin enablement before using these methods
  return {
    availablePhoneNumbers: (country: string) => ({
      tollFree: { list: async (params: any) => [] },
      mobile: { list: async (params: any) => [] },
      local: { list: async (params: any) => [] },
    }),
  };
}

export function getTwilioNumbers() {
  return [];
}
