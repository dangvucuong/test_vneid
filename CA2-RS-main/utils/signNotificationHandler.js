let key2SignHandler = null;
let pendingKey2Message = null;

export function registerKey2SignHandler(handler) {
  key2SignHandler = handler;
  if (key2SignHandler && pendingKey2Message) {
    const message = pendingKey2Message;
    pendingKey2Message = null;
    key2SignHandler(message);
  }
}

export async function handleKey2SignNotification(remoteMessage) {
  const data = remoteMessage?.data || remoteMessage?.notification?.data;
  if (!data) {
    return false;
  }
  const key = String(data.key);
  if (key !== "2") {
    return false;
  }
  const normalizedMessage = {
    ...remoteMessage,
    data,
  };
  if (!key2SignHandler) {
    pendingKey2Message = normalizedMessage;
    return true;
  }
  await key2SignHandler(normalizedMessage);
  return true;
}

export async function handleOpenedSignNotification(remoteMessage) {
  if (!remoteMessage?.data) {
    return false;
  }
  return handleKey2SignNotification(remoteMessage);
}
