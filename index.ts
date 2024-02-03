"use strict";

import axios from "axios";
import fs from "fs";
import FormData from "form-data";

import messageParser from "./messageParser.ts";

interface Headers {
  [key: string]: string;
}

interface MakeRequestOptions {
  url: string;
  method?: string;
  headers?: Headers;
  body?: unknown;
}

interface Contact {
  input: string;
  wa_id: string;
}

interface Message {
  id: string;
}

interface WhatsAppResponse {
  status: string;
  data: {
    messaging_product: string;
    contacts: Contact[];
    messages: Message[];
  };
}

interface Button {
  title: string;
  id: string;
}

interface Row {
  id: string;
  title: string;
  description: string;
}

interface Radios {
  title: string;
  rows?: Row[];
}

interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  country_code?: string | null;
  type?: string | null;
}

interface Email {
  email?: string | null;
  type?: string | null;
}

interface Name {
  formatted_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  suffix?: string | null;
  prefix?: string | null;
}

interface Organization {
  company?: string | null;
  department?: string | null;
  title?: string | null;
}

interface Phone {
  phone?: string | null;
  type?: string | null;
  wa_id?: string | null;
}

interface URL {
  url?: string | null;
  type?: string | null;
}

interface ContactProfile {
  addresses?: Address[];
  emails?: Email[];
  name?: Name;
  org?: Organization;
  phones?: Phone[];
  urls?: URL[];
  birthday?: string | null;
}

class WhatsappCloud {
  private accessToken: string;
  private graphAPIVersion: string;
  private senderPhoneNumberId: string;
  private WABA_ID: string;
  private baseUrl: string;

  constructor({
    accessToken,
    graphAPIVersion,
    senderPhoneNumberId,
    WABA_ID,
  }: {
    accessToken: string;
    graphAPIVersion?: string;
    senderPhoneNumberId: string;
    WABA_ID: string;
  }) {
    this.accessToken = accessToken;
    this.graphAPIVersion = graphAPIVersion || "v16.0";
    this.senderPhoneNumberId = senderPhoneNumberId;
    this.WABA_ID = WABA_ID;
    this.baseUrl = `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}`;

    if (!this.accessToken) {
      throw new Error('Missing "accessToken"');
    }

    if (!this.senderPhoneNumberId) {
      throw new Error('Missing "senderPhoneNumberId".');
    }

    if (graphAPIVersion) {
      console.warn(
        `Please note, the default "graphAPIVersion" is v15.0. You are using ${graphAPIVersion}. This may result in quirky behavior.`
      );
    }
  }

  private defaultHeaders(): Headers {
    const output: Headers = {
      "Content-Type": "application/json",
      "Accept-Language": "en_US",
      Accept: "application/json",
    };

    if (this.accessToken) {
      output["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return output;
  }

  private async _makeRequest({
    url,
    method,
    headers,
    body,
  }: MakeRequestOptions): Promise<WhatsAppResponse> {
    return new Promise((resolve, reject) => {
      const defaultBody = {};
      const defaultMethod = "GET";

      if (!url) {
        throw new Error('"url" is required in making a request');
      }

      if (!method) {
        console.warn(
          `WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`
        );
      }

      if (!headers) {
        console.warn(`WARNING: "headers" is missing.`);
      }

      if (method?.toUpperCase() === "POST" && !body) {
        console.warn(
          `WARNING: "body" is missing. The default body will default to ${JSON.stringify(
            defaultBody
          )}. If this is not what you want, please specify the body.`
        );
      }

      method = method?.toUpperCase() || defaultMethod;
      headers = {
        ...this.defaultHeaders(),
        ...headers,
      };
      body = body || defaultBody;
      const fullUrl = `${this.baseUrl}${url}`;

      axios({
        method: method,
        url: fullUrl,
        headers: headers,
        data: body,
      })
        .then(function (res) {
          if (res.data.error) {
            const errorObject = () => {
              try {
                return res.data.error || JSON.parse(res.request.response);
              } catch (e) {
                return {
                  error: res.request.response,
                };
              }
            };
            reject({
              status: "failed",
              ...errorObject(),
            });
          } else {
            resolve({
              status: "success",
              data: res.data,
            });
          }
        })
        .catch(function (error) {
          reject({
            status: "failed",
            error: error.response.data,
          });
        });
    });
  }

  private _mustHaveRecipientPhone = (recipientPhone: string | number): void => {
    if (!recipientPhone) {
      throw new Error('"recipientPhone" is required in making a request');
    }
  };

  private _mustHaveMessage = (message: string): void => {
    if (!message) {
      throw new Error('"message" is required in making a request');
    }
  };

  private _mustHaveMessageId = (messageId: string | undefined | null) => {
    if (!messageId) {
      throw new Error('"messageId" is required in making a request');
    }
  };

  private async _uploadMedia({
    file_path,
    file_name,
  }: {
    file_path: string;
    file_name?: string;
  }): Promise<any> {
    const mediaFile = fs.createReadStream(file_path);
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);

      const response = await axios.post(
        `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
          params: {
            messaging_product: "whatsapp",
          },
        }
      );

      return {
        status: "success",
        media_id: response.data.id,
        file_name: file_name || null,
      };
    } catch (error: any) {
      console.error(error.response.data);
      throw new Error(error.response?.data || "Error uploading media");
    }
  }

  public parseMessage(requestBody: any) {
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }

  public async markMessageAsRead({ messageId }: { messageId: string }): Promise<unknown> {
    try {
      this._mustHaveMessageId(messageId);

      return await this._makeRequest({
        url: `/messages`,
        method: "POST",
        body: {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        },
      });
    } catch (error) {
      // const msg = error?.error_data?.details;
      // if (msg && msg.includes("last-seen message in this conversation")) {
      //   //ignore error anyway: If message is already read or has already been deleted - since whatever the error it is non-retryable.
      //   return {
      //     status: "success",
      //     data: { success: false, error: msg },
      //   };
      // } else {
      return {
        status: "failed",
        error,
      };
      // }
    }
  }

  public async sendText({
    message,
    recipientPhone,
  }: {
    message: string;
    recipientPhone: string | number;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);
    this._mustHaveMessage(message);

    const body = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
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
    listOfButtons: Button[];
  }): Promise<WhatsAppResponse> {
    this._mustHaveMessage(message);
    this._mustHaveRecipientPhone(recipientPhone);

    const validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }
        if (button.title.length > 20) {
          throw new Error("The button title must be between 1 and 20 characters long.");
        }
        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }
        if (button.id.length > 256) {
          throw new Error("The button id must be between 1 and 256 characters long.");
        }

        return {
          type: "reply",
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
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: message,
        },
        action: {
          buttons: validButtons,
        },
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
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
    headerText: string;
    bodyText: string;
    footerText?: string;
    buttonName: string;
    listOfSections: Radios[];
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (!bodyText) throw new Error('"bodyText" is required in making a request');
    if (!headerText) throw new Error('"headerText" is required in making a request');
    if (!buttonName) throw new Error('"buttonName" is required in making a request');

    const validSections = listOfSections
      .map((section) => {
        const title = section.title;

        const rows = section.rows?.map((row) => {
          if (!row.id) {
            throw new Error('"row.id" of an item is required in list of radio buttons.');
          }
          if (row.id.length > 200) {
            throw new Error("The row id must be between 1 and 200 characters long.");
          }
          if (!row.title) {
            throw new Error('"row.title" of an item is required in list of radio buttons.');
          }
          if (row.title.length > 24) {
            throw new Error("The row title must be between 1 and 24 characters long.");
          }
          if (!row.description) {
            throw new Error('"row.description" of an item is required in list of radio buttons.');
          }
          if (row.description.length > 72) {
            throw new Error("The row description must be between 1 and 72 characters long.");
          }

          return {
            id: row.id,
            title: row.title,
            description: row.description,
          };
        });

        if (!title) {
          throw new Error('"title" of a section is required in list of radio buttons.');
        }

        return {
          title,
          rows,
        };
      })
      .filter(Boolean);

    if (validSections.length > 10) {
      throw new Error("The total number of items in the rows must be equal or less than 10.");
    }

    if (validSections.length === 0) {
      throw new Error('"listOfSections" is required in making a request');
    }

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: headerText,
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText,
        },
        action: {
          button: buttonName ?? "Select Item",
          sections: validSections,
        },
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });
  }

  public async sendImage({
    recipientPhone,
    caption,
    file_path,
    file_name,
    url,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    file_name?: string;
    url?: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (file_path && url) {
      throw new Error(
        'You can only send an image in your "file_path" or an image in a publicly available "url". Provide either "file_path" or "url".'
      );
    }

    if (!file_path && !url) {
      throw new Error(
        'You must send an image in your "file_path" or an image in a publicly available "url". Provide either "file_path" or "url".'
      );
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "image",
      image: {
        caption: caption || "",
      },
    };

    if (file_path) {
      const uploadedFile = await this._uploadMedia({
        file_path,
        file_name,
      });
      body.image.id = uploadedFile.media_id;
    } else if (url) {
      body.image.link = url;
    }

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });

    // return {
    //   response,
    //   body,
    // };
  }

  public async sendVideo({
    recipientPhone,
    caption,
    file_path,
    file_name,
    url,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    file_name?: string;
    url?: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (file_path && url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    if (!file_path && !url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "video",
      video: {
        caption: caption || "",
      },
    };

    if (file_path) {
      const uploadedFile = await this._uploadMedia({
        file_path,
        file_name,
      });
      body.video.id = uploadedFile.media_id;
    } else if (url) {
      body.video.link = url;
    }

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });

    // return {
    //   response,
    //   body,
    // };
  }

  public async sendAudio({
    recipientPhone,
    caption,
    file_path,
    file_name,
    url,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    file_name?: string;
    url?: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (file_path && url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    if (!file_path && !url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "audio",
      audio: {
        caption: caption || "",
      },
    };

    if (file_path) {
      const uploadedFile = await this._uploadMedia({
        file_path,
        file_name,
      });
      body.audio.id = uploadedFile.media_id;
    } else if (url) {
      body.audio.link = url;
    }

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });

    // return {
    //   response,
    //   body,
    // };
  }

  public async sendDocument({
    recipientPhone,
    caption,
    file_path,
    url,
  }: {
    recipientPhone: string | number;
    caption?: string;
    file_path?: string;
    url?: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (file_path && url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    if (!file_path && !url) {
      throw new Error('Provide either "file_path" or "url"');
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "document",
      document: {
        caption: caption || "",
      },
    };

    if (file_path) {
      const uploadedFile = await this._uploadMedia({
        file_path,
        file_name: caption,
      });
      body.document.id = uploadedFile.media_id;
      body.document.filename = uploadedFile.file_name || "";
    } else if (url) {
      body.document.link = url;
    }

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });

    // return {
    //   response,
    //   body,
    // };
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
    name: string;
    address: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (!latitude || !longitude) {
      throw new Error('"latitude" and "longitude" are required');
    }

    if (!name || !address) {
      throw new Error('"name" and "address" are required');
    }

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "location",
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });
  }

  public async sendContact({
    recipientPhone,
    contact_profile,
  }: {
    recipientPhone: string | number;
    contact_profile: ContactProfile;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    const formatAddress = (address: Address): Address => {
      return {
        street: address.street || null,
        city: address.city || null,
        state: address.state || null,
        zip: address.zip || null,
        country: address.country || null,
        country_code: address.country_code || null,
        type: address.type || null,
      };
    };

    const formatEmail = (email: Email): Email => {
      return {
        email: email.email || null,
        type: email.type || null,
      };
    };

    const formatName = (name: Name): Name => {
      if (!name || !name.first_name || !name.last_name) {
        throw new Error('Provide both "name.first_name" and "name.last_name".');
      }
      return {
        formatted_name: name.formatted_name || null,
        first_name: name.first_name || null,
        last_name: name.last_name || null,
        middle_name: name.middle_name || null,
        suffix: name.suffix || null,
        prefix: name.prefix || null,
      };
    };

    const formatOrg = (org: Organization): Organization => {
      return {
        company: org.company || null,
        department: org.department || null,
        title: org.title || null,
      };
    };

    const formatPhone = (phone: Phone): Phone => {
      return {
        phone: phone.phone || null,
        type: phone.type || null,
        wa_id: phone.wa_id || null,
      };
    };

    const formatURL = (url: URL): URL => {
      return {
        url: url.url || null,
        type: url.type || null,
      };
    };

    const formatBirthday = (birthday: string | null): string | null => {
      if (!birthday) {
        return null;
      } else {
        const isValidDate = (dateObject: string): boolean => {
          return new Date(dateObject).toString() !== "Invalid Date";
        };

        if (!isValidDate(birthday)) {
          throw new Error('Provide a valid date in format: "YYYY-MM-DD"');
        }

        return birthday;
      }
    };

    const formatContact = (contact: ContactProfile): ContactProfile => {
      const fields: ContactProfile = {
        addresses: [],
        emails: [],
        name: {},
        org: {},
        phones: [],
        urls: [],
        birthday: "",
      };

      if (contact.addresses && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
        fields.addresses = contact.addresses.map(formatAddress);
      }

      if (contact.emails && Array.isArray(contact.emails) && contact.emails.length > 0) {
        fields.emails = contact.emails.map(formatEmail);
      }

      if (contact.name && typeof contact.name === "object") {
        fields.name = formatName(contact.name);
      }

      if (contact.org && typeof contact.org === "object") {
        fields.org = formatOrg(contact.org);
      }

      if (contact.phones && Array.isArray(contact.phones) && contact.phones.length > 0) {
        fields.phones = contact.phones.map(formatPhone);
      }

      if (contact.urls && Array.isArray(contact.urls) && contact.urls.length > 0) {
        fields.urls = contact.urls.map(formatURL);
      }

      if (contact.birthday) {
        fields.birthday = formatBirthday(contact.birthday);
      }

      return fields;
    };

    const body = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "contacts",
      contacts: [formatContact(contact_profile)],
    };

    const response = await this._makeRequest({
      url: "/messages",
      method: "POST",
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
    headerText: string;
    bodyText: string;
    footerText: string;
    buttonName: string;
    url: string;
  }): Promise<WhatsAppResponse> {
    this._mustHaveRecipientPhone(recipientPhone);

    if (!url) {
      throw new Error('You must Provide a "url".');
    }

    const body = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "interactive",
      interactive: {
        type: "cta_url",

        header: {
          type: "text",
          text: headerText,
        },

        body: {
          text: bodyText,
        },

        footer: {
          text: footerText,
        },
        action: {
          name: "cta_url",
          parameters: {
            display_text: buttonName,
            url,
          },
        },
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
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
    this._mustHaveRecipientPhone(recipientPhone);
    this._mustHaveMessageId(messageId);

    if (!emoji) {
      throw new Error('Please provide an "emoji".');
    }

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "reaction",
      reaction: {
        message_id: messageId,
        emoji,
      },
    };

    return await this._makeRequest({
      url: "/messages",
      method: "POST",
      body,
    });
  }
}

export default WhatsappCloud;
