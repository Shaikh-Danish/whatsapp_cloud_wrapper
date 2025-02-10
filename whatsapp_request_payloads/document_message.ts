import Whatsapp from '../src/whatsapp_message';

const DOCUMENT_MESSAGE = {
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
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggNDNERUE4QTlDRjBCQjYzN0M4OENDRUFGRTVGRURENTQA',
                timestamp: '1733046524',
                type: 'document',
                document: {
                  filename: 'DOC-20241121-WA0010_copy.pdf',
                  mime_type: 'application/pdf',
                  sha256: '4CyDX3T/YFMn7X7bZ0EytStM4AHy4U516l3w1fDwi8I=',
                  id: '9239774362708417',
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

const message = new Whatsapp(DOCUMENT_MESSAGE);

console.log(message.message);
