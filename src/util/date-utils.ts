import { parse, set, isValid } from 'date-fns';

export const getFullFnsDate = (date: Date | undefined, timeString: string | undefined): Date | undefined => {
  if (!date) return;

  let hour = 0;
  let minute = 0;

  if (timeString) {
    const parsedTime = parse(timeString, 'HH:mm', new Date());
    if (isValid(parsedTime)) {
      hour = parsedTime.getHours();
      minute = parsedTime.getMinutes();
    }
  }

  const newDate = set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
  return newDate;
};