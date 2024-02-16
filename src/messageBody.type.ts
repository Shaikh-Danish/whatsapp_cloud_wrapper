export interface WhatsappBody {
  object: string;
  entry: WhatsAppEntry[];
}

interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

interface WhatsAppValue {
  messaging_product: string;
  metadata: WhatsAppMetadata;
  contacts: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface WhatsAppStatus {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    }[];
  }[];
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  }[];
  errors?: Error[];
}

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  context?: {
    from: string;
    id: string;
  };
  type: string;
  errors?: any;
  text?: TextMessage;
  interactive?: Interactive;
  image?: Media;
  video?: Media;
  document?: Document;
  location?: Location;
  contacts?: Contact[];
  audio?: Audio;
  button?: {
    payload: string;
    text: string;
  }
}

interface Error {
  code: number;
  title: string;
  message: string;
  error_data: { details: string };
}

interface TextMessage {
  body: string;
}

interface Interactive {
  type: string;
  button_reply?: ButtonReply;
  list_reply?: ButtonReply;
  nfm_reply?: FlowReply;
}

interface ButtonReply {
  id: string;
  title: string;
}

interface FlowReply {
  response_json: string;
  body: string;
  name: string;
}

interface Media {
  mime_type: string;
  sha256: string;
  id: string;
}

interface Document extends Media {
  filename: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface Name {
  first_name: string;
  last_name: string;
  formatted_name: string;
}

interface Phone {
  phone: string;
  wa_id: string;
  type: string;
}

interface Contact {
  name: Name;
  phones: Phone[];
}

interface Audio extends Media {
  voice: boolean;
}

export interface MessageBody {
  // metadata: WhatsAppMetadata;
  // contacts: WhatsAppContact;
  // WABA_ID: string;
  isNotificationMessage: boolean;
  isMessage: boolean;
  message?: ResponseMessage;
  notificationType?: string;
  notificationMessage?: {
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
    from: { name: null; phone: string };
    errors?: Error[];
  };
}

interface ResponseMessage {
  from: From;
  timestamp: string;
  type?: string;
  text?: TextMessage;
  interactive?: Interactive;
  image?: Media;
  video?: Media;
  document?: Document;
  location?: Location;
  contacts?: Contact[];
  audio?: Audio;
  thread: Thread | null;
  // message_id: string;
}

interface From {
  name: string | null;
  phone: string;
  message_id?: string;
}

interface Thread {
  from: From;
}

export interface RequestBody {
  messaging_product: string;
  to: string | number;
  type: string;
  text?: {
    preview_url: boolean;
    body: string;
  };
  interactive?: {
    type: string;
    body?: {
      text?: string;
    };
    footer?: {
      text?: string;
    };
    header?: {
      type: string;
      text?: string;
    };
    action?: {
      button: string;
      sections?: Radios[];
      buttons: ButtonReply[];
    };
  };
  image?: {
    caption: string;
    link?: string;
    id?: string;
  };
  video?: {
    caption: string;
    link?: string;
    id?: string;
  };
  audio?: {
    caption: string;
    link?: string;
    id?: string;
  };
}

interface Radios {
  title: string;
  rows?: Row[];
}
interface Row {
  id: string;
  title: string;
  description: string;
}
