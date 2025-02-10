// import Whatsapp from '../src/whatsapp_message';

const IMAGE_MESSAGE = {
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
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggRkFGMDc4MjE4Q0RCQkE5NjNDNTg3MTZFRTQzQzIwNDcA',
                timestamp: '1733046622',
                type: 'image',
                image: {
                  mime_type: 'image/jpeg',
                  sha256: 'ZYgWD4N1OIRGoKZqOfXhCsS6j/tLpUGca3VJfxQ+xmQ=',
                  id: '601857195736198',
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

// const message = new Whatsapp(IMAGE_MESSAGE);

// console.log(message.message);
