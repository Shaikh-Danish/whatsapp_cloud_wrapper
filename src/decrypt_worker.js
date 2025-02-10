import { parentPort, workerData } from 'worker_threads';
import * as crypto from 'crypto';

// Worker thread logic
function decryptData(privatePem, encryptedBody) {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } =
    encryptedBody;

  // Decrypt the AES key
  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: crypto.createPrivateKey(privatePem),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encrypted_aes_key, 'base64')
  );

  console.log(decryptedAesKey);

  // Prepare buffers
  const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
  const initialVectorBuffer = Buffer.from(initial_vector, 'base64');

  // Decrypt flow data
  const TAG_LENGTH = 16;
  const encryptedFlowDataBody = flowDataBuffer.subarray(0, -TAG_LENGTH);
  const encryptedFlowDataTag = flowDataBuffer.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    'aes-128-gcm',
    decryptedAesKey,
    initialVectorBuffer
  );
  decipher.setAuthTag(encryptedFlowDataTag);

  const decryptedJSONString = Buffer.concat([
    decipher.update(encryptedFlowDataBody),
    decipher.final(),
  ]).toString('utf-8');

  return {
    decryptedBody: JSON.parse(decryptedJSONString),
    aesKeyBuffer: decryptedAesKey,
    initialVectorBuffer,
  };
}

// Check if running as a worker thread
if (parentPort && workerData) {
  try {
    const { privatePem, encryptedBody } = workerData;

    const result = decryptData(privatePem, encryptedBody);

    parentPort.postMessage(result);
  } catch (error) {
    console.error('Error decrypting data:', error);
    parentPort.postMessage({
      error:
        error instanceof Error ? error.message : 'Unknown decryption error',
    });
  }
}

export { decryptData };
