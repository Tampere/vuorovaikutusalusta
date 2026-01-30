import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';

interface Props {
  children: string;
}

export default function MarkdownViewer({ children }: Props) {
  return (
    <ReactMarkdown
      rehypePlugins={[
        () =>
          rehypeExternalLinks({
            target: '_blank',
            rel: 'noopener noreferrer',
          }),
      ]}
      remarkPlugins={[remarkBreaks]}
    >
      {children}
    </ReactMarkdown>
  );
}
