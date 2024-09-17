/**
 * Creates a mock dataTransfer event of the specified type containing the supplied list of files.
 *
 * @param {string} eventType The event's type, generally used as a trigger.
 * @param {File[]} files An array of files to be transfered by the event.
 */
export const createMockDataTransferEvent = (eventType: string, files: File[]): Event => {
  const dataTransferObject = {
    dataTransfer: {
      files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  };
  const event = new Event(eventType, { bubbles: true });
  Object.assign(event, dataTransferObject);
  return event;
};
