import Image from '@tiptap/extension-image';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

const sharedExtensions = [
  Markdown.configure({
    markedOptions: {
      gfm: true,
      breaks: true,
    },
  }),
  StarterKit,
  Image.configure({
    HTMLAttributes: {
      style: 'max-width: 100%; height: auto;',
    },
  }),
];

export const textEditorConfig = {
  extensions: sharedExtensions,
  contentType: 'markdown' as const,
  editable: true,
};

export const textViewerConfig = {
  extensions: sharedExtensions,
  contentType: 'markdown' as const,
  editable: false,
};
