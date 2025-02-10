import WhatsAppCloud from './whatsapp_api';

const WhatsApp = new WhatsAppCloud({
  accessToken:
    'EAAbw2JDpDkUBO6FfVGZCQCVLE73yDZCzov3l52QdKRZCcAnWLqEZAMjFGHg9BUtt1CxLxtUCqNt5xO0L4S1S3tRidRi5ybBWTrHCkGczMaSCPJOnYrouzzRTF7KHZAOgyPTZBlGwFMLVF8ZCWLuFLwM6ZBAI1ZB5kJww1rlk19O3TizgaWkhja45oRKlSMqwIMLzUlgZDZD',
  senderPhoneNumberId: '558207774034481',
  WABA_ID: '489271830941248',
});

const resp = await WhatsApp.sendTextMessageTemplate({
  recipientPhone: 918657854260,
  templateName: 'client_message_3',
  language: 'en_US',
  messages: ['body.message'],
});

// console.log(resp.error.error.error_data);

// const resp = await WhatsApp.sendMediaQuickReplyMessageTemplate({
//   // recipientPhone: employer.employerNumber,
//   recipientPhone: 918657854260,
//   templateName: 'daily_live_report',
//   language: 'en_US',
//   payloads: ['activateSession'],
//   messages: ['h'],
//   mediaId: '1524415204934347',
//   mediaType: 'document',
// });

// const resp = await WhatsApp.sendMediaQuickReplyMessageTemplate({
//   // recipientPhone: employer.employerNumber,
//   recipientPhone: 918657854260,
//   templateName: 'employer_start_session',
//   language: 'en_US',
//   payloads: ['activateSession'],
//   mediaUrl:
//     'https://i.ibb.co/r7H5pPk/Copy-of-Copy-of-Cut-Costs-by-Over-Rs-15000-Monthly-with-Attendance-Tracking-2.png',
// });
// console.log(resp);

// const response = await WhatsApp.decryptFlow({
//   encrypted_flow_data:
//     '0ZTvBBSkmBythiq/883EONDpK5y6tqHYAbfdWD1iW7iISY+p9wMWdNmkvD8rOcrM96jbe3fDsl90oEkwXA6KkmauliyVV0yvqpexZ5YnuvsFMhA1+kzt4LQgGyRiuZMSw6QTj/1+G2bWzSf/RqLghvTv0K29PMzbY+BAnhnyrlH9vG+a2dCPS7XkvvaJd31hK2p8UPQr6pPRLWqV/5e1TcZRrqTDzI73RMGlproXQXFwa1wKa0ScFqhGZzKHHA==',
//   encrypted_aes_key:
//     'lIIz4wNjR5paXjKU/ckvCFaKj71VuIumQZGuRT4H/R/OTV2p+M6qu6Xeq6NkWqYBSJIP5bY8YpSbVZKPQFORDT/TAW32EajXlivSYxOG2Vqc/W9GBX2Y1UpnG0skIXm8nnUGv59nfPbvBVA340L2zVBF4CaREiauVv68x9MGkZHk6VE+h16RadLEfRIRV3TIhw0priFeVPVcTVg5029dCjUBdwAQMMP5nRJCJXWXkhJwfh7cYKlWD7ZqHhEbzfxOVzDOjf4z1jLuMTbod1rtdOxsFPZ8X8/+dpjfb6CjHcArCr2ES1etW5SSs4FlKuCs0WtMHY67G1y/G5bdRMJp5A==',
//   initial_vector: 'OiLS4DrnjsDYWgiw3WuKpg==',
// });

// const flow_data = {
//   screen: 'ADMIN_FLOW',
//   data: {
//     data: 'example',
//   },
// };

// const response = await WhatsApp.sendFlow({
//   body: 'hello world',
//   recipientPhone: '918657854260',
//   flow_cta: 'Admin',
//   flow_token: 'Test',
//   flow_id: '945693937619461',
//   flow_data,
//   draft: true,
// });

// if (response && response.status === 'failed') {
//   console.log(response.error.error);
// }

// const m = await WhatsApp.sendRadioButtons({
//   bodyText: 'Hello, world',
//   recipientPhone: 918657854260,
//   listOfSections: [
//     {
//       title: 'title',
//       rows: [
//         {
//           id: 'id',
//           title: 'title',
//         },
//       ],
//     },
//     {
//       title: 'title',
//       rows: [
//         {
//           id: 'id',
//           title: 'title',
//           description: 'description',
//         },
//       ],
//     },
//   ],
//   buttonName: 'Open',
// });

// const m = await WhatsApp.sendAudio({
//   recipientPhone: 918657854260,
//   id: '593175963163441',
// });

// const m = await WhatsApp.sendAudio({
//   recipientPhone: 918657854260,
//   url: 'https://download.samplelib.com/mp3/sample-3s.mp3',
// });

// const m = await WhatsApp.sendAudio({
//   recipientPhone: 918657854260,
//   file_path:
//     '/Users/priyesh-main/personal/whatsapp_cloud_wrapper/sample-9s.mp3',
// });

// const m = await WhatsApp.sendVideo({
//   recipientPhone: 918657854260,
//   id: '590556390180750',
// });

// const m = await WhatsApp.sendVideo({
//   recipientPhone: 918657854260,
//   file_path: 'SampleVideo_360x240_1mb.mp4',
// });

// const m = await WhatsApp.sendVideo({
//   recipientPhone: 918657854260,
//   url: 'https://www.sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
// });

// const m = await WhatsApp.sendImage({
//   recipientPhone: 918657854260,
//   url: 'https://img.pikbest.com/wp/202345/wallpaper-hd-landscape-wallpapers-free-download-png_9591924.jpg!bw700',
// });

// const m = await WhatsApp.sendImage({
//   recipientPhone: 918657854260,
//   id: '907163224891738',
// });

// const m = await WhatsApp.sendImage({
//   recipientPhone: 918657854260,
//   file_path:
//     '/Users/priyesh-main/personal/whatsapp_cloud_wrapper/vecteezy_wallpapers-for-the-beautiful-peacock-wallpaper-ai-generated_32257185.jpg',
// });

// const m = await WhatsApp.sendDocument({
//   recipientPhone: 918657854260,
//   url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
//   file_name: 'dummy pdf',
// });

// const m = await WhatsApp.sendDocument({
//   recipientPhone: 918657854260,
//   id: '1186389963201624',
//   file_name: 'dummy pdf',
// });

// const m = await WhatsApp.sendDocument({
//   recipientPhone: 918657854260,
//   file_path: '/Users/priyesh-main/personal/whatsapp_cloud_wrapper/dummy.pdf',
//   file_name: 'dummy pdf',
// });

// const m = await WhatsApp.sendLocation({
//   recipientPhone: 918657854260,
//   latitude: 20.4705664,
//   longitude: 75.0102818,
// });

// const m = await WhatsApp.sendLocation({
//   recipientPhone: 918657854260,
//   latitude: 20.4705664,
//   longitude: 75.0102818,
//   name: 'Pune',
// });

// const m = await WhatsApp.sendLocation({
//   recipientPhone: 918657854260,
//   latitude: 20.4705664,
//   longitude: 75.0102818,
//   name: 'Pune',
//   address: 'Pune, Maharashtra, India',
// });

// const m = await WhatsApp.sendContact({
//   recipientPhone: 918657854260,
//   contact_profile: {
//     name: {
//       first_name: 'Danish',
//       last_name: 'Shaikh',
//       formatted_name: 'Shaikh Danish',
//     },
//     phones: [
//       {
//         phone: '+919999999999',
//         wa_id: '999999999999',
//       },
//     ],
//   },
// });

// const m = await WhatsApp.sendCallToActionButton({
//   recipientPhone: 918657854260,
//   url: 'https://attendance.autowhat.app',
//   bodyText: 'Attendance Dashboard',
//   buttonName: 'Open',
// });

// const m = await WhatsApp.sendLocationButton({
//   recipientPhone: 918657854260,
//   message: 'Mark Attendance',
// });

// const m = await WhatsApp.getMediaUrl({
//   mediaId: '1186389963201624',
// });

// const m = await WhatsApp.getMediaUrl({
//   mediaId: '1186389963201624',
// });

// if (m.status === 'failed') {
//   console.log(m.error);
// } else if (m.status === 'success') {
//   console.log(m.data);
// }
