const MESSAGE_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '<WHATSAPP_BUSINESS_ACCOUNT_ID>',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '<BUSINESS_DISPLAY_PHONE_NUMBER>',
              phone_number_id: '<BUSINESS_PHONE_NUMBER_ID>',
            },
            contacts: [
              {
                profile: {
                  name: '<WHATSAPP_USER_NAME>',
                },
                wa_id: '<WHATSAPP_USER_ID>',
              },
            ],
            messages: [
              {
                from: '<WHATSAPP_USER_PHONE_NUMBER>',
                id: '<WHATSAPP_MESSAGE_ID>',
                timestamp: '<WEBHOOK_SENT_TIMESTAMP>',
                text: {
                  body: '<MESSAGE_BODY_TEXT>',
                },
                type: 'text',
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                reaction: {
                  message_id: 'MESSAGE_ID',
                  emoji: 'EMOJI',
                },
                type: 'reaction',
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                type: 'image',
                image: {
                  caption: 'CAPTION',
                  mime_type: 'image/jpeg',
                  sha256: 'IMAGE_HASH',
                  id: 'ID',
                },
              },
              {
                from: 'SENDER_PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                type: 'sticker',
                sticker: {
                  mime_type: 'image/webp',
                  sha256: 'HASH',
                  id: 'ID',
                },
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                errors: [
                  {
                    code: 131051,
                    details: 'Message type is not currently supported',
                    title: 'Unsupported message type',
                  },
                ],
                type: 'unknown',
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                location: {
                  latitude: 'LOCATION_LATITUDE',
                  longitude: 'LOCATION_LONGITUDE',
                  name: 'LOCATION_NAME',
                  address: 'LOCATION_ADDRESS',
                },
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                contacts: [
                  {
                    addresses: [
                      {
                        city: 'CONTACT_CITY',
                        country: 'CONTACT_COUNTRY',
                        country_code: 'CONTACT_COUNTRY_CODE',
                        state: 'CONTACT_STATE',
                        street: 'CONTACT_STREET',
                        type: 'HOME or WORK',
                        zip: 'CONTACT_ZIP',
                      },
                    ],
                    birthday: 'CONTACT_BIRTHDAY',
                    emails: [
                      {
                        email: 'CONTACT_EMAIL',
                        type: 'WORK or HOME',
                      },
                    ],
                    name: {
                      formatted_name: 'CONTACT_FORMATTED_NAME',
                      first_name: 'CONTACT_FIRST_NAME',
                      last_name: 'CONTACT_LAST_NAME',
                      middle_name: 'CONTACT_MIDDLE_NAME',
                      suffix: 'CONTACT_SUFFIX',
                      prefix: 'CONTACT_PREFIX',
                    },
                    org: {
                      company: 'CONTACT_ORG_COMPANY',
                      department: 'CONTACT_ORG_DEPARTMENT',
                      title: 'CONTACT_ORG_TITLE',
                    },
                    phones: [
                      {
                        phone: 'CONTACT_PHONE',
                        wa_id: 'CONTACT_WA_ID',
                        type: 'HOME or WORK>',
                      },
                    ],
                    urls: [
                      {
                        url: 'CONTACT_URL',
                        type: 'HOME or WORK',
                      },
                    ],
                  },
                ],
              },
              {
                context: {
                  from: 'PHONE_NUMBER',
                  id: 'wamid.ID',
                },
                from: '16315551234',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                type: 'button',
                button: {
                  text: 'No',
                  payload: 'No-Button-Payload',
                },
              },
              {
                from: 'PHONE_NUMBER_ID',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                interactive: {
                  list_reply: {
                    id: 'list_reply_id',
                    title: 'list_reply_title',
                    description: 'list_reply_description',
                  },
                  type: 'list_reply',
                },
                type: 'interactive',
              },
              {
                from: 'PHONE_NUMBER_ID',
                id: 'wamid.ID',
                timestamp: 'TIMESTAMP',
                interactive: {
                  button_reply: {
                    id: 'unique-button-identifier-here',
                    title: 'button-text',
                  },
                  type: 'button_reply',
                },
                type: 'interactive',
              },
              {
                from: 'PHONE_NUMBER',
                id: 'wamid.ID',
                text: {
                  body: 'MESSAGE_TEXT',
                },
                context: {
                  from: 'PHONE_NUMBER',
                  id: 'wamid.ID',
                  referred_product: {
                    catalog_id: 'CATALOG_ID',
                    product_retailer_id: 'PRODUCT_ID',
                  },
                },
                timestamp: 'TIMESTAMP',
                type: 'text',
              },
              {
                from: '16315551234',
                id: 'wamid.ABGGFlCGg0cvAgo6cHbBhfK5760V',
                order: {
                  catalog_id: 'the-catalog_id',
                  product_items: [
                    {
                      product_retailer_id: 'the-product-SKU-identifier',
                      quantity: 'number-of-item',
                      item_price: 'unitary-price-of-item',
                      currency: 'price-currency',
                    },
                  ],
                  text: 'text-message-sent-along-with-the-order',
                },
                context: {
                  from: '16315551234',
                  id: 'wamid.gBGGFlaCGg0xcvAdgmZ9plHrf2Mh-o',
                },
                timestamp: '1603069091',
                type: 'order',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

const NOTIFICATION_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '<WHATSAPP_BUSINESS_ACCOUNT_ID>',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '<BUSINESS_DISPLAY_PHONE_NUMBER>',
              phone_number_id: '<BUSINESS_PHONE_NUMBER_ID>',
            },
            statuses: [
              {
                id: '<WHATSAPP_MESSAGE_ID>',
                status: 'sent',
                timestamp: '<WEBHOOK_SENT_TIMESTAMP>',
                recipient_id: '<WHATSAPP_USER_ID>',
                conversation: {
                  id: '<CONVERSATION_ID>',
                  expiration_timestamp: '<CONVERSATION_EXPIRATION_TIMESTAMP>',
                  origin: {
                    type: '<CONVERSATION_CATEGORY>',
                  },
                },
                pricing: {
                  billable: '<IS_BILLABLE?>',
                  pricing_model: 'CBP',
                  category: '<CONVERSATION_CATEGORY>',
                },
              },
              {
                id: '<WHATSAPP_MESSAGE_ID>',
                status: 'sent',
                timestamp: '<WEBHOOK_SENT_TIMESTAMP>',
                recipient_id: '<WHATSAPP_USER_ID>',
                conversation: {
                  id: '<CONVERSATION_ID>',
                  origin: {
                    type: '<CONVERSATION_CATEGORY>',
                  },
                },
                pricing: {
                  billable: '<IS_BILLABLE?>',
                  pricing_model: 'CBP',
                  category: '<CONVERSATION_CATEGORY>',
                },
              },
              {
                id: '<WHATSAPP_MESSAGE_ID>',
                status: 'read',
                timestamp: '<WEBHOOK_SENT_TIMESTAMP>',
                recipient_id: '<WHATSAPP_USER_ID>',
              },
              {
                id: '<WHATSAPP_MESSAGE_ID>',
                status: 'failed',
                timestamp: '<WEBHOOK_SENT_TIMESTAMP>',
                recipient_id: '<WHATSAPP_USER_ID>',
                errors: [
                  {
                    code: '<ERROR_CODE>',
                    title: '<ERROR_TITLE>',
                    message: '<ERROR_MESSAGE>',
                    error_data: {
                      details: '<ERROR_DETAILS>',
                    },
                    href: 'https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/',
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
