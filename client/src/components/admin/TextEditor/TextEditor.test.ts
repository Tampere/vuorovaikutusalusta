import { Editor } from '@tiptap/core';
import { textEditorConfig, textViewerConfig } from './config';

type MarkType = 'bold' | 'italic';

function doc(...content: object[]) {
  return { type: 'doc' as const, content };
}

function paragraph(...content: object[]) {
  return content.length > 0
    ? { type: 'paragraph' as const, content }
    : { type: 'paragraph' as const };
}

function text(content: string, ...marks: MarkType[]) {
  return marks.length > 0
    ? {
        type: 'text' as const,
        text: content,
        marks: marks.map((type) => ({ type })),
      }
    : { type: 'text' as const, text: content };
}

function createEditor(
  config: typeof textEditorConfig | typeof textViewerConfig,
  content: string,
) {
  return new Editor({
    ...config,
    content,
  });
}

function roundtrip(
  config: typeof textEditorConfig | typeof textViewerConfig,
  markdown: string,
) {
  const editor = createEditor(config, markdown);
  const result = editor.getMarkdown();
  editor.destroy();
  return result;
}

describe.each([
  ['textEditorConfig', textEditorConfig],
  ['textViewerConfig', textViewerConfig],
] as const)('TextEditor markdown flow (%s)', (_name, config) => {
  test('preserves plain text', () => {
    const md = 'Hello world';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves heading', () => {
    const md = '### Otsikko';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves bold text', () => {
    const md = 'This is **bold** text';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves italic text', () => {
    const md = 'This is *italic* text';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves unordered list', () => {
    const input = '* Item one\n* Item two\n* Item three';
    const expected = '- Item one\n- Item two\n- Item three';
    expect(roundtrip(config, input)).toBe(expected);
  });

  test('preserves ordered list', () => {
    const md = '1. First\n2. Second\n3. Third';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves image with alt text', () => {
    const md = '![Kuva](https://example.com/image.png)';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves image with attribution', () => {
    const md =
      '![Kuva](https://example.com/image.png)\n\n*Kuvaaja: Test Person*';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves link', () => {
    const md = '[Linkki](https://example.com)';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves line breaks', () => {
    const input = 'First line\n\nSecond line\nThird line';
    const expected = 'First line\n\nSecond line  \nThird line';
    expect(roundtrip(config, input)).toBe(expected);
  });

  test('preserves combined formatting', () => {
    const input = [
      '### Ilmoitus',
      '',
      'Tämä on **tärkeä** ilmoitus jossa on *kursiivia*.',
      '',
      '* Kohta yksi',
      '* Kohta kaksi',
      '',
      '![Kuva](/api/file/general-notifications/test.png)',
    ].join('\n');

    const expected = [
      '### Ilmoitus',
      '',
      'Tämä on **tärkeä** ilmoitus jossa on *kursiivia*.',
      '',
      '- Kohta yksi',
      '- Kohta kaksi',
      '',
      '![Kuva](/api/file/general-notifications/test.png)',
    ].join('\n');

    expect(roundtrip(config, input)).toBe(expected);
  });

  test('preserves bold and italic on different words', () => {
    const md = '**bold word** and *italic word*';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('preserves multiple bold words with italic', () => {
    const md = '**first** normal *second* more **third**';
    expect(roundtrip(config, md)).toBe(md);
  });

  test('editor and viewer produce same output for same input', () => {
    const md = '### Title\n\nSome **bold** and *italic* text.\n\n* List item';
    const editorResult = roundtrip(textEditorConfig, md);
    const viewerResult = roundtrip(textViewerConfig, md);
    expect(editorResult).toBe(viewerResult);
  });
});

describe('Editor configs', () => {
  test('textEditorConfig creates editable editor', () => {
    const editor = createEditor(textEditorConfig, 'test');
    expect(editor.isEditable).toBe(true);
    editor.destroy();
  });

  test('textViewerConfig creates read-only editor', () => {
    const editor = createEditor(textViewerConfig, 'test');
    expect(editor.isEditable).toBe(false);
    editor.destroy();
  });
});

describe('Markdown to html', () => {
  test('renders line breaks as <br> in HTML', () => {
    const editor = createEditor(textEditorConfig, 'First line\nSecond line');
    expect(editor.getHTML()).toContain('<br>');
    editor.destroy();
  });

  test('renders double newline as separate paragraphs', () => {
    const editor = createEditor(textEditorConfig, 'First line\n\nSecond line');
    expect(editor.getHTML()).toBe('<p>First line</p><p>Second line</p>');
    editor.destroy();
  });
  test('renders bold and italic on different words as HTML', () => {
    const editor = createEditor(
      textViewerConfig,
      '**bold word** and *italic word*',
    );
    const html = editor.getHTML();
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).not.toContain('**');
    editor.destroy();
  });

  test('renders empty paragraph from nbsp ', () => {
    const editor = createEditor(
      textEditorConfig,
      'First line\n\n&nbsp;\n\nSecond line',
    );
    expect(editor.getHTML()).toBe('<p>First line</p><p></p><p>Second line</p>');
    editor.destroy();
  });
});

describe('Editor JSON to markdown', () => {
  test('parses valid markdown with trailing spaces', () => {
    const editorJson = doc(
      paragraph(
        text('Normal '),
        text('bold ', 'bold'),
        text('boldCursive   ', 'bold', 'italic'),
        text('bold.  ', 'bold'),
        text('cursive.  ', 'italic'),
        text('normal'),
      ),
    );
    const editor = createEditor(textEditorConfig, '');
    editor.commands.setContent(editorJson);
    expect(editor.getMarkdown()).toBe(
      'Normal **bold *boldCursive*   bold.**  *cursive.*  normal',
    );
  });
  test('parses valid markdown with leading spaces', () => {
    const editorJson = doc(
      paragraph(
        text('Normal '),
        text('  bold', 'bold'),
        text('boldCursive   ', 'bold', 'italic'),
        text('  bold', 'bold'),
        text('  cursive', 'italic'),
        text('normal'),
      ),
    );
    const editor = createEditor(textEditorConfig, '');
    editor.commands.setContent(editorJson);
    expect(editor.getMarkdown()).toBe(
      'Normal   **bold*boldCursive*     bold**  *cursive*normal',
    );
  });
});
