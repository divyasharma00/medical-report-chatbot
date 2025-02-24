import React from 'react';
import MessageBox from './messagebox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { TextSearch } from 'lucide-react';
import Markdown from './markdown';

const Messages = ({ messages, isLoading, data }) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((m, index) => (
        <MessageBox key={index} role={m.role} content={m.content} />
      ))}

      {/* Show relevant info if available */}
      {(data?.length !== undefined && data.length > 0) && (
        <Accordion type="single" className="text-sm" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="flex flex-row items-center gap-2">
                <TextSearch /> Relevant Info
              </span>
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap">
              <Markdown text={(data[data.length - 1]).retrievals} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default Messages;
