export interface TextMessage {
  text?: {
    body: string;
  };
}
export interface ReactionMessage {
  reaction?: {
    message_id: string;
    emoji: string;
  };
}
export interface IInteractiveButtonMessage {
  interactive?: Interactive;
}

export interface ImageMessage {
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}
export interface VideoMessage {
  video?: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}
export interface AudioMessage {
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    voice: boolean;
  };
}
export interface DocumentMessage {
  document?: {
    filename: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}
export interface FlowMessage {}
export interface StickerMessage {
  sticker?: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}
export interface UnknownMessage {
  errors?: ErrorDetail[];
}
export interface LocationMessage {
  location?: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}
export interface ContactMessage {
  contacts?: ContactDetail[];
}
export interface QuickReplyMessage {
  button?: {
    text: string;
    payload: string;
  };
}
export interface OrderMessage {
  order?: {
    catalog_id: string;
    product_items: ProductItem[];
    text: string;
  };
}
export interface ContextMessage {
  context?: {
    from: string;
    id: string;
    referred_product?: ReferredProduct;
  };
}
interface ReferredProduct {
  catalog_id: string;
  product_retailer_id: string;
}
interface ProductItem {
  product_retailer_id: string;
  quantity: string;
  item_price: string;
  currency: string;
}
export interface ContactDetail {
  addresses?: Address[];
  birthday?: string;
  emails?: Email[];
  name?: ContactName;
  org?: Organization;
  phones?: Phone[];
  urls?: URL[];
}
export interface Address {
  city: string | undefined;
  country: string | undefined;
  country_code: string | undefined;
  state: string | undefined;
  street: string | undefined;
  type: string | undefined;
  zip: string | undefined;
}
export interface Email {
  email: string | undefined;
  type: string | undefined;
}
export interface ContactName {
  formatted_name?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}
export interface Organization {
  company?: string;
  department?: string;
  title?: string;
}
export interface Phone {
  phone?: string;
  wa_id?: string;
  type?: string;
}
export interface URL {
  url: string | undefined;
  type: string | undefined;
}

interface ErrorDetail {
  code: number;
  details: string;
  title: string;
}

export interface IncomingMessage
  extends BaseMessage,
    ContextMessage,
    ITextMessage,
    IReactionMessage,
    IImageMessage,
    IStickerMessage,
    IUnknownMessage,
    ILocationMessage,
    IContactMessage,
    IQuickReplyMessage,
    IInteractiveButtonReply,
    IVideoMessage,
    IDocumentMessage,
    IAudioMessage,
    IFlowMessage {}

export interface BaseMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
}

export interface ITextMessage extends BaseMessage, TextMessage {}
export interface IReactionMessage extends BaseMessage, ReactionMessage {}
export interface IImageMessage extends BaseMessage, ImageMessage {}
export interface IVideoMessage extends BaseMessage, VideoMessage {}
export interface IAudioMessage extends BaseMessage, AudioMessage {}
export interface IDocumentMessage extends BaseMessage, DocumentMessage {}
export interface IFlowMessage extends BaseMessage {}
export interface IStickerMessage extends BaseMessage, StickerMessage {}
export interface ILocationMessage extends BaseMessage, LocationMessage {}
export interface IContactMessage extends BaseMessage, ContactMessage {}
export interface IQuickReplyMessage extends BaseMessage, QuickReplyMessage {}
export interface IInteractiveButtonReply extends BaseMessage {
  interactive?: Interactive;
}
type Interactive = {
  type: string;
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
  button_reply?: {
    id: string;
    title: string;
  };
  nfm_reply?: {
    response_json: string;
    body: string;
    name: string;
  };
};
export interface IOrderMessage extends BaseMessage, OrderMessage {}
export interface IUnknownMessage extends BaseMessage {
  errors?: ErrorDetail[];
}
interface ErrorDetail {
  code: number;
  details: string;
  title: string;
}

export interface NotificationPayload {
  id: string;
  status: NotificationStatus;
  timestamp: string;
  recipient_id: string;
  conversation?: Conversation;
  pricing?: Pricing;
  errors?: ErrorDetail[];
}
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'read';
interface Conversation {
  id: string;
  expiration_timestamp: string;
  origin: Origin;
}
interface Origin {
  type: string;
}
interface Pricing {
  billable: string;
  pricing_model: string;
  category: string;
}
interface ErrorDetail {
  code: number;
  title: string;
  message: string;
  error_data?: ErrorData;
  href: string;
}
interface ErrorData {
  details: string;
}

interface InteractiveButtonMessage {
  id: string;
  title: string;
  description?: string;
  flow_json?: Record<string, any>;
}

export type Message = IncomingBaseMessage &
  (
    | ({
        type: 'text';
      } & TextMessage)
    | ({
        type: 'simple_button';
      } & InteractiveButtonMessage)
    | ({
        type: 'radio_button';
      } & InteractiveButtonMessage)
    | ({
        type: 'document';
      } & DocumentMessage)
    | ({
        type: 'video';
      } & VideoMessage)
    | ({
        type: 'image';
      } & ImageMessage)
    | ({
        type: 'audio';
      } & AudioMessage)
    | ({
        type: 'location';
      } & LocationMessage)
    | ({
        type: 'contact';
      } & ContactMessage)
    | ({
        type: 'quick_reply';
      } & QuickReplyMessage)
    | {
        type: 'flow';
      }
    | ({
        type: 'reaction';
      } & ReactionMessage)
    | ({
        type: 'sticker';
      } & StickerMessage)
    | {
        type: 'unknown';
      }
    | ({
        type: 'flow';
      } & { flow_json: Record<string, any> })
  );

export interface IncomingBaseMessage {
  recipientPhone: number;
  recipientName: string;
  messageId: string;
  timestamp: number;
}

export type ParsedMessage =
  | ({
      isMessage: 'message';
    } & Message)
  | ({
      isMessage: 'notification';
    } & Notification);

export interface Notification {
  recipientPhone: number;
  messageId: string;
  timestamp: number;
  status: NotificationStatus;
  conversation: {
    id: string;
    expiration: number;
    origin: {
      type: string;
    };
  };
  pricing: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export interface Headers {
  [key: string]: string;
}

export type WhatsAppResponse =
  | {
      status: 'success';
      data: {
        messaging_product: string;
        contacts: ContactId[];
        messages: MessageId[];
      };
    }
  | {
      status: 'failed';
      error: {
        error: {
          message: string;
          type: string;
          code: number;
          error_data: {
            messaging_product: string;
            details: string;
          };
        };
      };
    };
export interface MakeRequestOptions {
  url: string;
  method?: string;
  headers?: Headers;
  body?: any;
  requestType?: string;
}
export interface SimpleButton {
  id: string;
  title: string;
}
export interface RadioButton {
  title: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}
interface ContactId {
  input: string;
  wa_id: string;
}
interface MessageId {
  id: string;
}

export interface WhatsAppPayload {
  object: string;
  entry: Entry[];
}
interface Entry {
  id: string;
  changes: Change[];
}
interface Change {
  value: ChangeValue;
  field: string;
}
interface ChangeValue {
  messaging_product: string;
  metadata: Metadata;
  contacts?: Contact[];
  messages?: IncomingMessage[];
  statuses?: NotificationPayload[];
}
interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}
export interface Contact {
  profile: Profile;
  wa_id: string;
}
interface Profile {
  name: string;
}
export {};
