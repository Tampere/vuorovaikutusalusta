export function replaceIdsWithNull(obj: any, depth: number) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj.hasOwnProperty('id')) {
    obj = { ...obj, id: depth };
  }

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; ++i) {
        obj[key][i] = replaceIdsWithNull(obj[key][i], depth - i);
      }
    } else {
      obj[key] = replaceIdsWithNull(obj[key], depth);
    }
  }

  return obj;
}

export function replaceTranslationsWithNull(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj.hasOwnProperty('en')) {
    obj = { ...obj, en: null };
  }

  for (const key in obj) {
    obj[key] = replaceTranslationsWithNull(obj[key]);
  }

  return obj;
}
