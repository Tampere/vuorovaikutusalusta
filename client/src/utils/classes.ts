/**
 * Simple helper function for making it possible to use an array of classes in React components
 * @param classes Array of classes
 * @returns Filtered and joined class string
 */
export function getClassList(classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
