/* eslint-disable @typescript-eslint/no-explicit-any */

type BasicObject = { [key: string]: any };

export const isError = (errObject: BasicObject, rawField: string): boolean => {
  const splitField = rawField.split(".");

  if (!errObject[splitField[0]]) return false;

  if (splitField.length === 1) {
    return true;
  } else {
    return isError(
      errObject[splitField[0]],
      splitField.slice(1).reduce((a, b) => {
        if (splitField.length === 1) {
          return a + b;
        } else return a + "." + b;
      })
    );
  }
};
