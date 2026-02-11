import React from "react";

interface Props {
  text: string;
  className?: string;
}

const LinkifiedText = ({ text, className = "" }: Props) => {
  const processText = (inputText: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    
    // Combined regex to find both markdown links and plain URLs
    // Markdown links should be checked first to avoid double-processing
    const combinedRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = combinedRegex.exec(inputText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        elements.push(
          <React.Fragment key={`text-${lastIndex}`}>
            {inputText.substring(lastIndex, match.index)}
          </React.Fragment>
        );
      }
      
      // Check if it's a markdown link [text](url)
      if (match[1] && match[2]) {
        elements.push(
          <a
            key={`link-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red-500 hover:text-brand-red-600 underline underline-offset-2 transition-colors duration-200 font-medium"
          >
            {match[1]}
          </a>
        );
      }
      // Otherwise it's a plain URL
      else if (match[3]) {
        elements.push(
          <a
            key={`link-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red-500 hover:text-brand-red-600 underline underline-offset-2 transition-colors duration-200 break-all"
          >
            {match[3]}
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last match
    if (lastIndex < inputText.length) {
      elements.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {inputText.substring(lastIndex)}
        </React.Fragment>
      );
    }
    
    return elements.length > 0 ? elements : [inputText];
  };

  return <div className={className}>{processText(text)}</div>;
};

export default LinkifiedText;
