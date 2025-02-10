import type { WhatsAppPayload } from './index.d';
import type { ParsedMessage } from './index.d';

import messageParser from './message_parser';

export default class WhatsappMessage {
  public message: ParsedMessage;

  constructor(requestBody: WhatsAppPayload) {
    this.message = this.#parseMessage(requestBody);
  }

  #parseMessage(requestBody: WhatsAppPayload): ParsedMessage {
    return messageParser(requestBody);
  }
}
