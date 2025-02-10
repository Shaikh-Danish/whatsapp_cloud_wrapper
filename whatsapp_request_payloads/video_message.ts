// import Whatsapp from '../src/whatsapp_message';

const VIDEO_MESSAGE = {
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
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggNjZEQTJDQTExQzVDQzQ3Q0ExQjIwOTExQTkwMTk5QTgA',
                timestamp: '1733046676',
                type: 'video',
                video: {
                  mime_type: 'video/mp4',
                  sha256: 'zbmxTyxx3VXKqg3TsE9ZZ2WlzUhNjC16MNtco1ANIJU=',
                  id: '1636974626885800',
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

// const message = new Whatsapp(VIDEO_MESSAGE);

// console.log(message.message);
