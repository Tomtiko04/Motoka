import React, { useState } from 'react';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between w-full p-4 text-left bg-white hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="p-4 bg-gray-50">{children}</div>}
    </div>
  );
};

const Accordion = ({ items }) => {
  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;