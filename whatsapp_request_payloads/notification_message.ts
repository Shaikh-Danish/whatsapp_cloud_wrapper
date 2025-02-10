import { WhatsappMessage } from '../src/index';

const NOTIFICATION_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '442476028955381',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '919140624820',
              phone_number_id: '402214169651966',
            },
            statuses: [
              {
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAERgSOEE0RUU2RkE3RDI3ODEwQzk4AA==',
                status: 'sent',
                timestamp: '1734690594',
                recipient_id: '918657854260',
                conversation: {
                  id: '8ead10d4db34b59989d33ee5d56cec5d',
                  expiration_timestamp: '1734775980',
                  origin: { type: 'service' },
                },
                pricing: {
                  billable: true,
                  pricing_model: 'CBP',
                  category: 'service',
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

const whatsappMessage = new WhatsappMessage(NOTIFICATION_PAYLOAD);

console.log(whatsappMessage);
