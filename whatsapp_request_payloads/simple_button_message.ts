// import Whatsapp from '../src/whatsapp_message';

const SIMPLE_BUTTON_MESSAGE = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '104378769380033',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '919082406664',
              phone_number_id: '103394529479781',
            },
            contacts: [{ profile: { name: 'Danish' }, wa_id: '918657854260' }],
            messages: [
              {
                context: {
                  from: '919082406664',
                  id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAERgSMzVFMkFEQjU0OUI0MjFEMzUzAA==',
                },
                from: '918657854260',
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhgWM0VCMDhDQTFEOTkwOUQ4NDY5QzNCQQA=',
                timestamp: '1733057541',
                type: 'interactive',
                interactive: {
                  type: 'list_reply',
                  list_reply: { id: 'in', title: '🟢 IN' },
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

// const message = new Whatsapp(SIMPLE_BUTTON_MESSAGE);

// console.log(message.message);
