import { WhatsappBody, MessageBody } from "./messageBody.type";

export default ({
  requestBody,
  currentWABA_ID,
}: {
  requestBody: WhatsappBody;
  currentWABA_ID: any;
}) => {
  if (!requestBody) {
    throw new Error('"requestBody" is required');
  }

  if (!currentWABA_ID) {
    throw new Error(
      "currentWABA_ID is required. This is the business ID that you have configured in your WABA account."
    );
  }

  const entryArray = requestBody.entry;

  // ? first check if the message is a whatsapp message
  if (!Array.isArray(entryArray)) {
    throw new Error(
      'requestBody is not a valid whatsapp message. Hint: check the "entry" property'
    );
  }

  if (!Object.hasOwn(requestBody, "object") && requestBody.object !== "whatsapp_business_account") {
    throw new Error(
      'requestBody is not a valid whatsapp message. Hint: check the "object" property'
    );
  }

  const entry = entryArray[0];

  // ? check whatsapp business ID is valid and exist in requestBody
  const WABA_ID = entry?.id;
  if (WABA_ID == "0") {
    console.warn(
      `WABA_ID is 0. You seem to be testing with Meta test subscription. This is not really a valid WABA_ID. I recommend you to send an actual message from an actual whatsapp customer's number.`
    );
  }

  if (!WABA_ID || WABA_ID !== currentWABA_ID) {
    throw new Error(
      "WABA_ID is not valid. Hint: the message is not intended for this Whatsapp Business Account."
    );
  }

  const changesArray = entry.changes;
  const changes = changesArray[0];
  if (!changesArray?.length || changes.field !== "messages") {
    throw new Error(
      'requestBody is not a valid whatsapp message. Hint: check the "changes" property'
    );
  }

  const changesValue = changes.value;
  // const metadata = changesValue.metadata;
  // const contacts = changesValue.contacts?.length ? changesValue.contacts[0] : null;

  // ? Messages vs Notifications
  const message = changesValue?.messages?.length ? changesValue.messages[0] : null;

  let notificationMessage = changesValue?.statuses?.length ? changesValue.statuses[0] : null;

  const output = {
    // metadata,
    // contacts,
    // WABA_ID: currentWABA_ID,
  } as MessageBody;

  if (notificationMessage) {
    output.isNotificationMessage = true;
    output.isMessage = false;
    output.notificationType = notificationMessage.status;
    output.notificationMessage = {
      id: notificationMessage.id as string,
      status: notificationMessage.status as string,
      timestamp: notificationMessage.timestamp as string,
      recipient_id: notificationMessage.recipient_id as string,
      from: { name: null, phone: notificationMessage.recipient_id as string },
    };
  } else if (message) {
    output.isNotificationMessage = false;
    output.isMessage = true;

    if (message.type === "unsupported") {
      message.type = "unknown_message";

      if (message.errors?.length) {
        output.isNotificationMessage = true;
        output.isMessage = false;
        notificationMessage = {
          errors: message.errors,
        };
      }
    }

    let msgType: string | undefined;

    if (Object.hasOwn(message, "interactive")) {
      const interactive = message.interactive;

      if (interactive?.type === "list_reply") {
        msgType = "radio_button_message";
      } else if (interactive?.type === "button_reply") {
        msgType = "simple_button_message";
      } else if (interactive?.type === "nfm_reply") {
        msgType = "flow_message";
      }
    } else if (Object.hasOwn(message, "type")) {
      const type = message.type;

      if (type === "button") {
        msgType = "quick_reply_message";
      } else {
        msgType = type + "_message";
      }
    }

    message.type = msgType as string;

    let thread = null;

    if (message.context) {
      const context = message.context;

      thread = {
        from: {
          phone: context.from,
          name: context.from,
          message_id: context.id,
        },
      };
    }

    output.message = {
      ...message,
      from: {
        name: changesValue.contacts?.[0]?.profile?.name as string | null,
        phone: message?.from,
      },
      thread,
    };
  }

  return output;
};
