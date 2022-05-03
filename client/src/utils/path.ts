/**
 * Creates full file path with given file name and file path.
 * @param filePath File path as an array of path segments
 * @param fileName File name
 * @returns Full file path
 */
export function getFullFilePath(filePath: string[], fileName: string) {
  return filePath.length === 0 ? fileName : filePath.join('/') + '/' + fileName;
}
