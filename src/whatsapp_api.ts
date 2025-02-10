'use strict';

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { Worker } from 'worker_threads';

import type {
  Headers,
  MakeRequestOptions,
  RadioButton,
  SimpleButton,
  WhatsAppResponse,
  Address,
  ContactDetail,
  ContactName,
  Email,
  Organization,
  Phone,
  URL,
} from './index.d';

export default class WhatsAppCloud {
  #accessToken: string;
  #graphAPIVersion: string;
  #senderPhoneNumberId: string;
  #WABA_ID: string;
  #url: string;
  #baseUrl: string;

  constructor({
    accessToken,
    graphAPIVersion,
    senderPhoneNumberId,
    WABA_ID,
  }: {
    accessToken?: string;
    graphAPIVersion?: string;
    senderPhoneNumberId?: string;
    WABA_ID?: string;
  }) {
    this.#accessToken =
      accessToken || process.env.WHATAPP_CLOUD_API_ACCESS_TOKEN!;
    this.#senderPhoneNumberId =
      senderPhoneNumberId ||
      process.env.WHATAPP_CLOUD_API_SENDER_PHONE_NUMBER_ID!;
    this.#WABA_ID = WABA_ID || process.env.WHATAPP_CLOUD_API_WABA_ID!;

    this.#graphAPIVersion = graphAPIVersion || 'v18.0';

    this.#url = `https://graph.facebook.com/${this.#graphAPIVersion}`;
    this.#baseUrl = `${this.#url}/${this.#senderPhoneNumberId}`;

    if (!this.#accessToken) {
      throw new Error('Missing "accessToken"');
    }

    if (!this.#senderPhoneNumberId) {
      throw new Error('Missing "senderPhoneNumberId".');
    }

    if (!this.#WABA_ID) {
      throw new Error('Missing "WABA_ID".');
    }
  }

  #prepareHeaders(): Headers {
    const output: Headers = {
      'Content-Type': 'application/json',
      'Accept-Language': 'en_US',
      Accept: 'application/json',
    };

    if (this.#accessToken) {
      output['Authorization'] = `Bearer ${this.#accessToken}`;
    }

    return output;
  }

  async #sendApiRequest({
    url,
    method = 'GET',
    headers = {},
    body = {},
    requestType = 'apiUrl',
  }: MakeRequestOptions): Promise<WhatsAppResponse> {
    if (!url) {
      throw new Error('"url" is required for making a request');
    }

    if (method.toUpperCase() === 'POST' && Object.keys(body).length === 0) {
      console.warn('WARNING: POST request with empty body');
    }

    const fullUrl =
      requestType === 'customUrl' ? url : `${this.#baseUrl}${url}`;

    try {
      const requestHeaders = {
        ...this.#prepareHeaders(),
        ...headers,
      };

      const response = await axios({
        method: method.toUpperCase(),
        url: fullUrl,
        headers: requestHeaders,
        data: body,
      });

      if (response.data.error) {
        return {
          status: 'failed',
          error: response.data.error || response.request.response,
        };
      }

      return {
        status: 'success',
        data: response.data,
      };
    } catch (error: any) {
      return {
        status: 'failed',
        error: error.response?.data || error.message,
      };
    }
  }

  #mustHaveRecipientPhone = (recipientPhone: string | number): void => {
    if (!recipientPhone) {
      throw new Error('"recipientPhone" is required in making a request');
    }
  };

  #mustHaveMessage = (message: string): void => {
    if (!message) {
      throw new Error('"message" is required in making a request');
    }
  };

  #mustHaveMessageId = (messageId: string | undefined | null) => {
    if (!messageId) {
      throw new Error('"messageId" is required in making a request');
    }
  };

  async uploadMedia({
    file_path,
    file_name,
  }: {
    file_path: string;
    file_name?: string;
  }): Promise<
    | {
        status: 'success';
        mediaId: string;
        fileName: string;
      }
    | { status: 'failed'; error: any }
  > {
    try {
      const mediaFile = fs.createReadStream(file_path);

      const formData = new FormData();
      formData.append('file', mediaFile);

      const response = await axios.post(`${this.#baseUrl}/media`, formData, {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        params: {
          messaging_product: 'whatsapp',
        },
      });

      return {
        status: 'success',
        mediaId: response.data.id,
        fileName: file_name || '',
      };
    } catch (error: any) {
      let errorMessage: any = error.response?.data;

      if (!errorMessage) {
        if (error.code === 'ENOENT') {
          errorMessage = {
            error: {
              message: `File or directory not found: ${
                error.path || 'Unspecified path'
              }`,
              error_data: {
                details: `Please verify:
                - The file path exists
                - You have correct read permissions
                - The file hasn't been moved or deleted
                - The current working directory is correct`,
              },
            },
          };
        } else if (error.code === 'EACCES') {
          errorMessage = {
            error: 'Permission denied',
            error_data: {
              details: `Unable to access ${
                error.path || 'the specified file/directory'
              } Check file permissions and ensure you have sufficient access rights.`,
            },
          };
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      return {
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  #createFlow({
    header,
    body,
    footer,
    flow_id,
    flow_cta,
    flow_token,
    flow_data,
    draft,
    recipientPhone,
  }: {
    header?: string;
    body: string;
    footer?: string;
    flow_id: string;
    flow_cta: string;
    flow_token?: string;
    flow_data?: any;
    draft?: boolean;
    recipientPhone: string;
  }) {
    const flowObj = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: header ?? 'Hi',
        },
        body: {
          text: body ?? 'Body',
        },
        footer: {
          text: footer ?? '-',
        },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token,
            flow_id,
            flow_cta,
          },
        },
      },
    };

    if (draft) {
      (flowObj.interactive.action.parameters as any).mode = 'draft';
    }

    if (flow_data) {
      if (!flow_data.screen) {
        throw new Error(
          'Screen Name is required when sending custom flow data'
        );
      }

      (flowObj.interactive.action.parameters as any)['flow_action_payload'] = {
        screen: flow_data.screen,
        data: flow_data.data,
      };
    } else {
      (flowObj.interactive.action.parameters as any).flow_action =
        'data_exchange';
    }

    return flowObj;
  }

  #createFlowData(screenName: string, screenData: any) {
    return {
      screen: screenName,
      data: screenData,
    };
  }

  public async markMessageAsRead({
    messageId,
  }: {
    messageId: string;
  }): Promise<WhatsAppResponse> {
    try {
      this.#mustHaveMessageId(messageId);

      return await this.#sendApiRequest({
        url: `/messages`,
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
      });
    } catch (error: any) {
      return {
        status: 'failed',
        error: error.message,
      };
    }
  }

  public async sendText({
    message,
    recipientPhone,
  }: {
    message: string;
    recipientPhone: string | number;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);
    this.#mustHaveMessage(message);

    const body = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendSimpleButtons({
    recipientPhone,
    message,
    listOfButtons,
  }: {
    recipientPhone: string | number;
    message: string;
    listOfButtons: SimpleButton[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveMessage(message);
    this.#mustHaveRecipientPhone(recipientPhone);

    const validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }

        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }

        if (button.title.length > 20) {
          throw new Error(
            'The button title must be between 1 and 20 characters long.'
          );
        }

        if (button.id.length > 256) {
          throw new Error(
            'The button id must be between 1 and 256 characters long.'
          );
        }

        return {
          type: 'reply',
          reply: {
            title: button.title,
            id: button.id,
          },
        };
      })
      .filter(Boolean);

    if (validButtons.length === 0) {
      throw new Error('"listOfButtons" is required in making a request');
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: validButtons,
        },
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendRadioButtons({
    recipientPhone,
    headerText,
    bodyText,
    footerText,
    buttonName,
    listOfSections,
  }: {
    recipientPhone: string | number;
    headerText?: string;
    bodyText: string;
    footerText?: string;
    buttonName: string;
    listOfSections: RadioButton[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!bodyText) {
      throw new Error('"bodyText" is required in making a request');
    }

    if (!buttonName) {
      throw new Error('"buttonName" is required in making a request');
    }

    if (!listOfSections) {
      throw new Error('"listOfSections" is required in making a request');
    }

    if (!Array.isArray(listOfSections)) {
      throw new Error('"listOfSections" must be an array');
    }

    if (listOfSections.length === 0) {
      throw new Error('"listOfSections" must contain at least one section');
    }

    const validSections = listOfSections
      .map((section) => {
        const title = section.title;

        if (!title) {
          throw new Error(
            '"title" of a section is required in list of radio buttons.'
          );
        }

        const rows = section.rows?.map((row) => {
          if (!row.id) {
            throw new Error(
              '"row.id" of an item is required in list of radio buttons.'
            );
          }

          if (row.id.length > 200) {
            throw new Error(
              'The row id must be between 1 and 200 characters long.'
            );
          }

          if (!row.title) {
            throw new Error(
              '"row.title" of an item is required in list of radio buttons.'
            );
          }

          if (row.title.length > 24) {
            throw new Error(
              'The row title must be between 1 and 24 characters long.'
            );
          }

          //   if (!row.description) {
          //     throw new Error(
          //       '"row.description" of an item is required in list of radio buttons.'
          //     );
          //   }

          if (row.description && row.description.length > 72) {
            throw new Error(
              'The row description must be between 1 and 72 characters long.'
            );
          }

          return {
            id: row.id,
            title: row.title,
            description: row?.description ?? '',
          };
        });

        return {
          title,
          rows,
        };
      })
      .filter(Boolean);

    if (validSections.length === 0) {
      throw new Error('"listOfSections" is required in making a request');
    }

    if (validSections.length > 10) {
      throw new Error(
        'The total number of items in the rows must be equal or less than 10.'
      );
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: headerText ?? '',
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText,
        },
        action: {
          button: buttonName ?? 'Select Item',
          sections: validSections,
        },
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendImage({
    recipientPhone,
    caption,
    file_path,
    url,
    id,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    url?: string;
    id?: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (file_path && url && id) {
      throw new Error(
        'You can only send an image in your "file_path" or an image in a publicly available "url" or uploaded image "id". Provide either "file_path" or "url" or "id".'
      );
    }

    if (!file_path || !url || !id) {
      throw new Error(
        'You must send an image in your "file_path" or an image in a publicly available "url" or uploaded image "id". Provide either "file_path" or "url" or "id".'
      );
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'image',
      image: {
        caption: caption || '',
      },
    };

    if (file_path) {
      const uploadedFile = await this.uploadMedia({
        file_path,
      });

      if (uploadedFile.status === 'failed') {
        return { status: 'failed', error: uploadedFile.error };
      }

      body.image.id = uploadedFile.mediaId;
    } else if (url) {
      body.image.link = url;
    } else if (id) {
      body.image.id = id;
    }

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendVideo({
    recipientPhone,
    caption,
    file_path,
    url,
    id,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    url?: string;
    id?: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (file_path && url && id) {
      throw new Error(
        'You can only send an video in your "file_path" or an video in a publicly available "url" or uploaded video "id". Provide either "file_path" or "url" or "id".'
      );
    }

    if (!file_path || !url || !id) {
      throw new Error(
        'You must send an video in your "file_path" or an video in a publicly available "url" or uploaded video "id". Provide either "file_path" or "url" or "id".'
      );
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'video',
      video: {
        caption: caption || '',
      },
    };

    if (file_path) {
      const uploadedFile = await this.uploadMedia({
        file_path,
      });

      if (uploadedFile.status === 'failed') {
        return { status: 'failed', error: uploadedFile.error };
      }

      body.video.id = uploadedFile.mediaId;
    } else if (url) {
      body.video.link = url;
    } else if (id) {
      body.video.id = id;
    }

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendAudio({
    recipientPhone,
    file_path,
    url,
    id,
  }: {
    recipientPhone: string | number;
    file_path?: string;
    url?: string;
    id?: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (file_path && url && id) {
      throw new Error(
        'You can only send an audio in your "file_path" or an audio in a publicly available "url" or uploaded audio "id". Provide either "file_path" or "url" or "id".'
      );
    }

    if (!file_path || !url || !id) {
      throw new Error(
        'You must send an audio in your "file_path" or an audio in a publicly available "url" or uploaded audio "id". Provide either "file_path" or "url" or "id".'
      );
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'audio',
      audio: {},
    };

    if (file_path) {
      const uploadedFile = await this.uploadMedia({
        file_path,
      });

      if (uploadedFile.status === 'failed') {
        return { status: 'failed', error: uploadedFile.error };
      }

      body.audio.id = uploadedFile.mediaId;
    } else if (url) {
      body.audio.link = url;
    } else if (id) {
      body.audio.id = id;
    }

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendDocument({
    recipientPhone,
    caption,
    file_path,
    url,
    id,
    file_name,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    url?: string;
    id?: string;
    file_name?: string;
  }): Promise<WhatsAppResponse> {
    try {
      this.#mustHaveRecipientPhone(recipientPhone);

      if (file_path && url && id) {
        throw new Error(
          'You can only send an document in your "file_path" or an document in a publicly available "url" or uploaded document "id". Provide either "file_path" or "url" or "id".'
        );
      }

      if (!file_path || !url || !id) {
        throw new Error(
          'You must send an document in your "file_path" or an document in a publicly available "url" or uploaded document "id". Provide either "file_path" or "url" or "id".'
        );
      }

      const body: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'document',
        document: {
          caption: caption || '',
          filename: file_name || '',
        },
      };

      if (file_path) {
        const uploadedFile = await this.uploadMedia({
          file_path,
          file_name: caption,
        });

        if (uploadedFile.status === 'failed') {
          return { status: 'failed', error: uploadedFile.error };
        }

        body.document.id = uploadedFile.mediaId;
        body.document.filename = file_name || '';
      } else if (url) {
        body.document.link = url;
      } else if (id) {
        body.document.id = id;
      }

      return await this.#sendApiRequest({
        url: '/messages',
        method: 'POST',
        body,
      });
    } catch (err: any) {
      return { status: 'failed', error: err.message };
    }
  }

  public async sendLocation({
    recipientPhone,
    latitude,
    longitude,
    name,
    address,
  }: {
    recipientPhone: string | number;
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!latitude || !longitude) {
      throw new Error('"latitude" and "longitude" are required');
    }

    // if (!name || !address) {
    //   throw new Error('"name" and "address" are required');
    // }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'location',
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendContact({
    recipientPhone,
    contact_profile,
  }: {
    recipientPhone: string | number;
    contact_profile: ContactDetail;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    const formatAddress = (address: Address): Address => {
      return {
        street: address.street || undefined,
        city: address.city || undefined,
        state: address.state || undefined,
        zip: address.zip || undefined,
        country: address.country || undefined,
        country_code: address.country_code || undefined,
        type: address.type || undefined,
      };
    };

    const formatEmail = (email: Email): Email => {
      return {
        email: email.email || undefined,
        type: email.type || undefined,
      };
    };

    const formatName = (name: ContactName): ContactName => {
      if (!name || !name.first_name || !name.last_name) {
        throw new Error('Provide both "name.first_name" and "name.last_name".');
      }
      return {
        formatted_name: name.formatted_name || undefined,
        first_name: name.first_name || undefined,
        last_name: name.last_name || undefined,
        middle_name: name.middle_name || undefined,
        suffix: name.suffix || undefined,
        prefix: name.prefix || undefined,
      };
    };

    const formatOrg = (org: Organization): Organization => {
      return {
        company: org.company || undefined,
        department: org.department || undefined,
        title: org.title || undefined,
      };
    };

    const formatPhone = (phone: Phone): Phone => {
      return {
        phone: phone.phone || undefined,
        type: phone.type || undefined,
        wa_id: phone.wa_id || undefined,
      };
    };

    const formatURL = (url: URL): URL => {
      return {
        url: url?.url || undefined,
        type: url?.type || undefined,
      };
    };

    const formatBirthday = (
      birthday: string | undefined
    ): string | undefined => {
      if (!birthday) {
        return undefined;
      } else {
        const isValidDate = (dateObject: string): boolean => {
          return new Date(dateObject).toString() !== 'Invalid Date';
        };

        if (!isValidDate(birthday)) {
          throw new Error('Provide a valid date in format: "YYYY-MM-DD"');
        }

        return birthday;
      }
    };

    const formatContact = (contact: ContactDetail): ContactDetail => {
      const fields: ContactDetail = {
        addresses: [],
        emails: [],
        name: {},
        org: {},
        phones: [],
        urls: [],
        birthday: '',
      };

      if (
        contact.addresses &&
        Array.isArray(contact.addresses) &&
        contact.addresses.length > 0
      ) {
        fields.addresses = contact.addresses.map(formatAddress);
      }

      if (
        contact.emails &&
        Array.isArray(contact.emails) &&
        contact.emails.length > 0
      ) {
        fields.emails = contact.emails.map(formatEmail);
      }

      if (contact.name && typeof contact.name === 'object') {
        fields.name = formatName(contact.name);
      }

      if (contact.org && typeof contact.org === 'object') {
        fields.org = formatOrg(contact.org);
      }

      if (
        contact.phones &&
        Array.isArray(contact.phones) &&
        contact.phones.length > 0
      ) {
        fields.phones = contact.phones.map(formatPhone);
      }

      if (
        contact.urls &&
        Array.isArray(contact.urls) &&
        contact.urls.length > 0
      ) {
        fields.urls = contact.urls.map(formatURL);
      }

      if (contact.birthday) {
        fields.birthday = formatBirthday(contact.birthday);
      }

      return fields;
    };

    const body = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'contacts',
      contacts: [formatContact(contact_profile)],
    };

    const response = await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  public async sendCallToActionButton({
    recipientPhone,
    headerText,
    bodyText,
    footerText,
    buttonName,
    url,
  }: {
    recipientPhone: string | number;
    headerText?: string;
    bodyText: string;
    footerText?: string;
    buttonName: string;
    url: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!url) {
      throw new Error('You must Provide a "url".');
    }

    const body = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        header: {
          type: 'text',
          text: headerText ?? '',
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText ?? '',
        },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: buttonName,
            url,
          },
        },
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendLocationButton({
    recipientPhone,
    message,
  }: {
    recipientPhone: string | number;
    message: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'INTERACTIVE',
      interactive: {
        type: 'location_request_message',
        body: {
          text: message,
        },
        action: {
          name: 'send_location',
        },
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendReactionMessage({
    recipientPhone,
    messageId,
    emoji,
  }: {
    recipientPhone: string | number;
    messageId: string;
    emoji: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);
    this.#mustHaveMessageId(messageId);

    if (!emoji) {
      throw new Error('Please provide an "emoji".');
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji,
      },
    };

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendTextMessageTemplate({
    recipientPhone,
    templateName,
    language,
    messages,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    messages?: string[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components = [
        {
          type: 'body',
          parameters: messages.map((message) => ({
            type: 'text',
            text: message,
          })),
        },
      ];
    }

    console.log(body.template.components[0]);

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendMediaMessageTemplate({
    recipientPhone,
    templateName,
    language,
    mediaId,
    mediaUrl,
    messages,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    mediaUrl?: string;
    mediaId?: string;
    messages?: string[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    // if (!mediaUrl && !mediaId) {
    //   throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    // }

    if (!mediaUrl || !mediaId) {
      throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: {
                  link: mediaUrl,
                  id: mediaId,
                },
              },
            ],
          },
        ],
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components.push({
        type: 'body',
        parameters: messages.map((message) => ({
          type: 'text',
          text: message,
        })),
      });
    }

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendQuickReplyMessageTemplate({
    recipientPhone,
    templateName,
    language,
    messages,
    payloads,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    messages?: string[];
    payloads: string[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    if (!Array.isArray(payloads) || payloads.length === 0) {
      throw new Error('You must provide at least one "button".');
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: [],
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components.push({
        type: 'body',
        parameters: messages.map((message) => ({
          type: 'text',
          text: message,
        })),
      });
    }

    payloads.forEach((payload, i) => {
      body.template.components.push({
        type: 'button',
        sub_type: 'quick_reply',
        index: String(i),
        parameters: [
          {
            type: 'payload',
            payload,
          },
        ],
      });
    });

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendMediaQuickReplyMessageTemplate({
    recipientPhone,
    templateName,
    language,
    mediaId,
    mediaUrl,
    messages,
    payloads,
    mediaType,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    mediaType?: string;
    mediaUrl?: string;
    mediaId?: string;
    messages?: string[];
    payloads: string[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    if (!Array.isArray(payloads) || payloads.length === 0) {
      throw new Error('You must provide at least one "button".');
    }

    if (!mediaUrl && !mediaId) {
      throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    }

    // if (!mediaUrl || !mediaId) {
    //   throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    // }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: mediaType,
                [mediaType as string]: {
                  link: mediaUrl,
                  id: mediaId,
                },
              },
            ],
          },
        ],
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components.push({
        type: 'body',
        parameters: messages.map((message) => ({
          type: 'text',
          text: message,
        })),
      });
    }

    payloads.forEach((payload, i) => {
      body.template.components.push({
        type: 'button',
        sub_type: 'quick_reply',
        index: String(i),
        parameters: [
          {
            type: 'payload',
            payload,
          },
        ],
      });
    });

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendCTAMessageTemplate({
    recipientPhone,
    templateName,
    language,
    messages,
    ctaUrl,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    messages?: string[];
    ctaUrl: string;
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    if (!ctaUrl) {
      throw new Error('You must provide a "url".');
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: [],
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components.push({
        type: 'body',
        parameters: messages.map((message) => ({
          type: 'text',
          text: message,
        })),
      });
    }

    body.template.components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: ctaUrl,
        },
      ],
    });

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async sendMediaCTAMessageTemplate({
    recipientPhone,
    templateName,
    language,
    mediaId,
    mediaUrl,
    messages,
    ctaUrl,
  }: {
    recipientPhone: string | number;
    templateName: string;
    language: string;
    ctaUrl: string;
    mediaUrl?: string;
    mediaId?: string;
    messages?: string[];
  }): Promise<WhatsAppResponse> {
    this.#mustHaveRecipientPhone(recipientPhone);

    if (!templateName) {
      throw new Error('You must provide a "templateName".');
    }

    if (!language) {
      throw new Error('You must provide a "language".');
    }

    if (!mediaUrl && !mediaId) {
      throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    }

    if (!mediaUrl || !mediaId) {
      throw new Error('You must provide a "mediaUrl" or "mediaId" property');
    }

    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: {
                  link: mediaUrl,
                  id: mediaId,
                },
              },
            ],
          },
        ],
      },
    };

    if (Array.isArray(messages) && messages.length > 0) {
      body.template.components.push({
        type: 'body',
        parameters: messages.map((message) => ({
          type: 'text',
          text: message,
        })),
      });
    }

    body.template.components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: ctaUrl,
        },
      ],
    });

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body,
    });
  }

  public async getMediaUrl({ mediaId }: { mediaId: string }) {
    if (!mediaId) {
      throw new Error('"mediaId" is required in making a request');
    }

    const url = `${this.#url}/${mediaId}`;
    const headers = {
      Authorization: `Bearer ${this.#accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    return await this.#sendApiRequest({
      url,
      headers,
      method: 'GET',
      requestType: 'customUrl',
    });
  }

  public async sendFlow({
    header,
    body,
    footer,
    flow_id,
    flow_cta,
    flow_token,
    flow_data,
    draft,
    recipientPhone,
    context,
  }: {
    header?: string;
    body: string;
    footer?: string;
    flow_id: string;
    flow_cta: string;
    flow_token?: string;
    flow_data?: any;
    draft?: boolean;
    recipientPhone: string;
    context?: string;
  }): Promise<WhatsAppResponse> {
    const flowObj = this.#createFlow({
      header,
      body,
      footer,
      flow_id,
      flow_cta,
      flow_token,
      flow_data,
      draft,
      recipientPhone,
    });

    if (context) {
      (flowObj as any).context = {
        message_id: context,
      };
    }

    return await this.#sendApiRequest({
      url: '/messages',
      method: 'POST',
      body: flowObj,
    });
  }

  // public async decryptFlow({
  //   encrypted_flow_data,
  //   encrypted_aes_key,
  //   initial_vector,
  // }: {
  //   encrypted_flow_data: string;
  //   encrypted_aes_key: string;
  //   initial_vector: string;
  // }) {
  //   const private_key = process.env.FLOW_PRIVATE_KEY;

  //   if (!private_key) {
  //     throw new Error('FLOW_PRIVATE_KEY environment variable is required');
  //   }
  // }

  /**
   * Decrypt request using a worker thread
   * @param encryptedBody Encrypted request body
   * @returns Promise with decrypted data
   */
  public async decryptFlow({
    encrypted_flow_data,
    encrypted_aes_key,
    initial_vector,
  }: {
    encrypted_flow_data: string;
    encrypted_aes_key: string;
    initial_vector: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      // const private_key = process.env.FLOW_PRIVATE_KEY;
      const private_key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0zEV2u/PovbsWn4noi9prcsww8zXXG4OiERW3reIPVt753XW
ZMb2NYDNvTRp2fxCNN3caZmBpoJe5erUehIwhJJMd04yey0yzvIrVHe+iluNWJ13
6G8JDl80ivtDgoxxE4x8HVXLyC2sWhPzurL1Xk1je74C1k46H9j9LZi0NRkHy3cA
ABIcXI8GzFTLdkWD2MOkv8OTNB49WqUUCm1JPC3lLgrXAxFyUuCZQfkFEg9bWxyp
nQ8RuG+f00iUXR/w7JBBQ1+4EKBN1tQSpYeKM8QhgKwc8IGF7QyNEjiw/scYGO1A
1Djv8pMBasvYsVD+oWX9rnb1fbMhlEjYIfU74wIDAQABAoIBAGM/yyST1MGiR1sT
tG6M1548QlOSHZerhRrW+vg5ykYDi0wwXawIsMZeHNIRIrm1yitsJFxgLsTgudZV
MLuZdsGmu1bKIgEvMZR9zI0qpRoCgn+lqSdLnzbo2RmDkat1cuKb/+wNWPJfPIMs
ozsXRSanOdx6ZHzwUHKNGBZokC/vE+VSydHbeUy3Txi4+75ZMTOCL/r/hur0hWoG
Sv7c/5sDWGhRFFV1CD/03pESn8Gu4qQW20eyai+WeebeIUjlV802chPdrn8ztIMb
Tn7K1mcrkPQlty3YJMS3KJt0idE5fzsw3KmANbJc4xjhN/FPNHz45Xk7O0g4qNmA
39g+LWECgYEA6UuMyFjsCLBWJMOj7b5Wa/JgpGAmS98Lnl501buvLi1xtYIIPmPh
78Ki7EaGu5YpVvx4lPQFd6HZaZu/KZLxYmtsprxA6MShOwKd4/yor9srgkxm1z53
AA2UrNbcN14TmKmi886dv5BsuhOCzgPXWEITKZiXGg2mRGId2z1OsnMCgYEA577W
zKoSdZYGMrwHbmbo1pQpXt7f4hBQBLXr7V9svG0CflsQcmHhwQtl8VtbRcyaLzOQ
cd2yQKSqdsXnW43BzBVH8wwuICxVnrqlRD63OmpmkPW50d87BKPH2/RVly3Aop0Q
PBiCN94iV+I5swYN9Bq0g+P/MGHUN6uXX3a1RNECgYEAjcq1Ti99hepm8QFXaO/+
Zq1xv3YQ0JxH24FdUWo5Fr/YFJFroT/j2m1ZyHE1Al5J0eyw/RczG3rrQRzAGuyM
eV0BNHXGnbKkq9DzVdYCUJ/M2ezFtJzqhsW6TzJntd8f2fGAcN5rUjrdWlrxbXU4
NRQzwVxUuikBnR5lNxMT+bECgYEAyYeMBC9iHh95BGW/kKKtmOz/jSEEUPMeovoR
UTvKs5GYuYk3pEC6scXXwSxRE0H6U1HkKyFAAjcwhllT+Kot/ewDxbix5Aip7H8j
eVWQwZwF1cna7kfSaxaClyTDydRf0QoFND2cADmMZCC3TJfXSpBuqsN7B/gLNN5j
pQD2YgECgYBjVaVDh+9BEIwGG5SC1eUPA3SbAW7zTJsDlH5ZjCR+0m0qP+lXQ8RK
E3Ikd/ani5LFtSUwzOjEdOkELuGlaEVByZnhiu0aY26OQRc0GCUTiaCkrOhy+WQI
MRzMRdDBDtp3suYiqov3yMMsEoudujLEAP/Uw+Fb3QejAsZpZx7kGg==
-----END RSA PRIVATE KEY-----`;

      if (!private_key) {
        throw new Error('FLOW_PRIVATE_KEY environment variable is required');
      }

      // Read private key
      // const privatePem = fs.readFileSync(this.privateKeyPath, 'utf8');

      // Resolve the absolute path to the worker script
      const workerPath = './decrypt_worker.js';

      // Create worker
      const worker = new Worker(workerPath, {
        workerData: {
          privatePem: private_key,
          encryptedBody: {
            encrypted_flow_data,
            encrypted_aes_key,
            initial_vector,
          },
        },
      });

      // // Success handler
      worker.on('message', (result) => {
        worker.terminate();

        // if ('error' in result) {
        //   reject(new Error(result.error));
        //   return;
        // }

        console.log(result);

        // resolve(result);
      });

      // Error handlers
      worker.on('error', (error) => {
        worker.terminate();
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}
