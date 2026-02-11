import React from "react";

interface Props {
  text: string;
  className?: string;
}

const LinkifiedText = ({ text, className = "" }: Props) => {
  // Regular expressions for detecting links
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const processText = (inputText: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // First, process markdown-style links [text](url)
    const textWithPlaceholders = inputText.replace(
      markdownLinkRegex,
      (match, text, url) => `__MARKDOWN_LINK_${text}::${url}__`
    );

    // Split by markdown placeholders and regular URLs
    const parts = textWithPlaceholders.split(/(__MARKDOWN_LINK_[^_]+__|(https?:\/\/[^\s]+))/g);

    parts.forEach((part, index) => {
      if (!part) return;

      // Handle markdown link placeholders
      if (part.startsWith("__MARKDOWN_LINK_")) {
        const linkData = part.replace("__MARKDOWN_LINK_", "").replace("__", "");
        const [linkText, linkUrl] = linkData.split("::");
        elements.push(
          <a
            key={index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red-500 hover:text-brand-red-600 underline underline-offset-2 transition-colors duration-200 font-medium"
          >
            {linkText}
          </a>
        );
      }
      // Handle plain URLs
      else if (urlRegex.test(part)) {
        const url = part.trim();
        elements.push(
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red-500 hover:text-brand-red-600 underline underline-offset-2 transition-colors duration-200 break-all"
          >
            {url}
          </a>
        );
      }
      // Handle regular text
      else {
        elements.push(<React.Fragment key={index}>{part}</React.Fragment>);
      }
    });

    return elements;
  };

  return <div className={className}>{processText(text)}</div>;
};

export default LinkifiedText;
