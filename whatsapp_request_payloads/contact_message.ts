// import Whatsapp from '../src/whatsapp_message';

const CONTACT_MESSAGE = {
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
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggQkExRDQ2M0Q5MDU2QjUzNzk2ODI2RDg4MkNEMTNGRjMA',
                timestamp: '1733057921',
                type: 'contacts',
                contacts: [
                  {
                    name: {
                      first_name: '8239988992',
                      formatted_name: '8239988992',
                    },
                  },
                ],
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

// const message = new Whatsapp(CONTACT_MESSAGE);

// console.log(message.message);
