import React from 'react';
import markdownit from 'markdown-it';
import DOMPurify from 'dompurify';

const md = markdownit();

const Markdown = ({ text }) => {
  const htmlContent = md.render(text);
  const sanitized = DOMPurify.sanitize(htmlContent);

  return (
    <div
      className="markdown-content prose max-w-full p-4 rounded-lg border bg-background shadow-md"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default Markdown;
