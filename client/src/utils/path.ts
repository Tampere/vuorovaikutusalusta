/**
 * Creates full file path with given organization, file name and file path.
 * @param organization The organization that uploaded the file
 * @param filePath File path as an array of path segments
 * @param fileName File name
 * @returns Full file path
 */
export function getFullFilePath(
  organization: string,
  filePath: string[],
  fileName: string,
) {
  return `${organization}/${filePath.join('/')}/${fileName}`;
}
