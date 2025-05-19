import { ErrorMessagesEnum } from 'enums';

export const parseString = (data: string) => {
  try {
    const parsedObj = JSON.parse(data);

    if (typeof parsedObj === 'object' && parsedObj !== null) {
      Object.keys(parsedObj).forEach((item) => {
        const value = parsedObj[item];
        if (typeof value === 'string') {
          try {
            parsedObj[item] = parseString(value);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            parsedObj[item] = value;
          }
        }
      });
    }
    return parsedObj;
  } catch (error) {
    const err = error as unknown as Error;
    throw new Error(`${ErrorMessagesEnum.JSON_PARSE_ERROR}. ${err.message}`);
  }
};
