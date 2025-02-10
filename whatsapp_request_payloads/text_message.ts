// import Whatsapp from '../src/whatsapp_message';

const TEXT_MESSAGE = {
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
                from: '918657854260',
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhgWM0VCMDk3NkZFRkFBNzNGRUY5NDdEOAA=',
                timestamp: '1733053422',
                text: { body: 'hi' },
                type: 'text',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

// const message = new Whatsapp(TEXT_MESSAGE);

// console.log(message.message);
