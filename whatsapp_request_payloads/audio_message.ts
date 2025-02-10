// import Whatsapp from '../src/whatsapp_message';

const AUDIO_MESSAGE = {
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
                id: 'wamid.HBgMOTE4NjU3ODU0MjYwFQIAEhggMkUxNUM4NTI2MDczREVFRDdEMkM0QjJDMDZCMTI0NUEA',
                timestamp: '1733046745',
                type: 'audio',
                audio: {
                  mime_type: 'audio/ogg; codecs=opus',
                  sha256: '944XE+1RcWf//Q2xWXHisEMR8W2gd2yebu1prvtqdkI=',
                  id: '948537820496015',
                  voice: true,
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

// const message = new Whatsapp(AUDIO_MESSAGE);

// console.log(message.message);
