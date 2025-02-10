import { WhatsappMessage } from '../src/index';

const FLOW_MESSAGE = {
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
            contacts: [{ profile: { name: 'Danish' }, wa_id: '918657854260' }],
            messages: [
              {
                context: {
                  from: '919140624820',
                  id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAERgSQTQyNEE1QkJDODQ2REY4QUVDAA==',
                },
                from: '918657854260',
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggQjVGRkQ2NUM2RTcwRDM4MkJDRTVCRDI5NDRENkE4OTAA',
                timestamp: '1734764424',
                type: 'interactive',
                interactive: {
                  type: 'nfm_reply',
                  nfm_reply: {
                    response_json:
                      '{"nutrientDeficiency":"Test ","farmerNumber":"918657854260","flow_token":"AgriSavant"}',
                    body: 'Sent',
                    name: 'flow',
                  },
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

const flowMessage: WhatsappMessage = new WhatsappMessage(FLOW_MESSAGE);

console.log(flowMessage);
