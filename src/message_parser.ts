import type {
  WhatsAppPayload,
  IncomingMessage,
  NotificationPayload,
  BaseMessage,
  Message,
  ParsedMessage,
  IncomingBaseMessage,
  Notification,
} from './index.d';

function messageParser(requestBody: WhatsAppPayload): ParsedMessage {
  const isValid = validateWhatsAppRequest(requestBody);

  if (isValid.valid === false) {
    throw new Error(isValid.error);
  }

  const changesValue = requestBody.entry[0].changes[0].value;

  const incomingMessage = changesValue?.messages?.[0];

  if (incomingMessage) {
    const baseMessage: IncomingBaseMessage = {
      recipientPhone: Number(changesValue?.contacts?.[0]?.wa_id),
      recipientName: changesValue?.contacts?.[0]?.profile?.name ?? '',
      messageId: incomingMessage.id,
      timestamp: parseInt(incomingMessage.timestamp),
    };

    const message = parseMessage(baseMessage, incomingMessage);

    const parsedMessage: ParsedMessage = {
      isMessage: 'message',
      ...baseMessage,
      ...message,
    };

    return parsedMessage;
  }
  const notificationMessage = changesValue?.statuses?.[0];

  if (!notificationMessage) {
    throw new Error(
      'Unable to parse incoming message or notification. Ensure your WABA payload is in the correct format.'
    );
  }

  const message = parseNotification(notificationMessage);

  const parsedMessage: ParsedMessage = {
    isMessage: 'notification',
    ...message,
  };

  return parsedMessage;
}

type ValidationResult = { valid: true } | { valid: false; error: string };

function validateWhatsAppRequest(
  requestBody: WhatsAppPayload
): ValidationResult {
  if (!requestBody) {
    return { valid: false, error: '"requestBody" is required' };
  }

  const currentWABA_ID = requestBody.entry[0].id;

  if (!currentWABA_ID) {
    return {
      valid: false,
      error:
        'currentWABA_ID is required. This is the business ID that you have configured in your WABA account.',
    };
  }

  const entryArray = requestBody.entry;

  if (!Array.isArray(entryArray)) {
    return {
      valid: false,
      error:
        'requestBody is not a valid WhatsApp message. Hint: check the "entry" property',
    };
  }

  if (
    !Object.hasOwn(requestBody, 'object') ||
    requestBody.object !== 'whatsapp_business_account'
  ) {
    return {
      valid: false,
      error:
        'requestBody is not a valid WhatsApp message. Hint: check the "object" property',
    };
  }

  const entry = entryArray[0];
  const WABA_ID = entry?.id;

  if (WABA_ID === '0') {
    console.warn(
      'WABA_ID is 0. You seem to be testing with Meta test subscription. This is not really a valid WABA_ID. I recommend sending an actual message from a real WhatsApp customer number.'
    );
  }

  if (!WABA_ID || WABA_ID !== currentWABA_ID) {
    return {
      valid: false,
      error:
        'WABA_ID is not valid. Hint: the message is not intended for this WhatsApp Business Account.',
    };
  }

  const changesArray = entry.changes;

  const changes = changesArray[0];
  if (!changesArray?.length || changes.field !== 'messages') {
    return {
      valid: false,
      error:
        'requestBody is not a valid whatsapp message. Hint: check the "changes" property',
    };
  }

  return { valid: true };
}

function parseMessage(
  baseMessage: IncomingBaseMessage,
  message: IncomingMessage
): Message {
  const type = message.type;

  if (type === 'text') {
    if (!message.text) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'text',
      text: message.text,
    };
  }

  if (type === 'interactive') {
    if (!message.interactive) {
      throw new Error('Invalid message');
    }

    if (message.interactive.type === 'button_reply') {
      return {
        ...baseMessage,
        type: 'simple_button',
        id: message.interactive.button_reply?.id!,
        title: message.interactive.button_reply?.title!,
      };
    }

    if (message.interactive.type === 'nfm_reply') {
      return {
        ...baseMessage,
        type: 'flow',
        flow_json: JSON.parse(message.interactive?.nfm_reply?.response_json!),
      };
    }

    return {
      ...baseMessage,
      type: 'radio_button',
      id: message.interactive.list_reply?.id!,
      title: message.interactive.list_reply?.title!,
      description: message.interactive.list_reply?.description,
    };
  }

  if (type === 'audio') {
    if (!message.audio) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'audio',
      audio: {
        id: message.audio.id,
        mime_type: message.audio.mime_type,
        sha256: message.audio.sha256,
        voice: message.audio.voice,
      },
    };
  }

  if (type === 'video') {
    if (!message.video) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'video',
      video: {
        id: message.video.id,
        mime_type: message.video.mime_type,
        sha256: message.video.sha256,
      },
    };
  }

  if (type === 'location') {
    if (!message.location) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'location',
      location: {
        latitude: message.location.latitude,
        longitude: message.location.longitude,
        name: message.location.name ?? '',
        address: message.location.address ?? '',
      },
    };
  }

  if (type === 'image') {
    if (!message.image) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'image',
      image: {
        id: message.image.id,
        mime_type: message.image.mime_type,
        sha256: message.image.sha256,
      },
    };
  }

  if (type === 'document') {
    if (!message.document) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'document',
      document: {
        id: message.document.id,
        mime_type: message.document.mime_type,
        sha256: message.document.sha256,
        filename: message.document.filename ?? '',
      },
    };
  }

  if (type === 'reaction') {
    if (!message.reaction) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'reaction',
      reaction: {
        message_id:
          message.reaction.message_id || (message.reaction as any)?.messsage_id,
        emoji: message.reaction.emoji,
      },
    };
  }

  if (type === 'sticker') {
    if (!message.sticker) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'sticker',
      sticker: {
        mime_type: message.sticker.mime_type,
        id: message.sticker.id,
        sha256: message.sticker.sha256,
      },
    };
  }

  if (type === 'contacts') {
    if (!message.contacts) {
      throw new Error('Invalid message');
    }

    return {
      ...baseMessage,
      type: 'contact',
      contacts: message.contacts,
    };
  }

  return {
    ...baseMessage,
    type: 'unknown',
  };
}

function parseNotification(notification: NotificationPayload): Notification {
  return {
    messageId: notification.id,
    status: notification.status,
    timestamp: Number(`${notification.timestamp}000`),
    recipientPhone: Number(notification.recipient_id),
    conversation: {
      expiration: Number(
        `${notification.conversation?.expiration_timestamp}000`
      ),
      id: notification?.conversation?.id ?? '',
      origin: {
        type: notification?.conversation?.origin?.type ?? '',
      },
    },
    pricing: {
      billable: Boolean(notification?.pricing?.billable ?? false),
      pricing_model: notification?.pricing?.pricing_model ?? '',
      category: notification?.pricing?.category ?? '',
    },
  };
}

export default messageParser;
