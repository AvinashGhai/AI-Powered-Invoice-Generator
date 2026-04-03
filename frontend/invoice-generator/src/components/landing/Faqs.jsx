import React, { useState, useRef, useEffect } from 'react';
import { FAQS } from '../../utils/data';

const FaqItem = ({ faq, isOpen, onClick }) => {
  const answerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(isOpen ? answerRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
      isOpen ? 'border-gray-300' : 'border-gray-200'
    }`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
      >
        <span className={`text-base font-medium text-left pr-4 transition-colors duration-200 ${
          isOpen ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {faq.question}
        </span>

        {/* Plus / minus icon */}
        <span className="flex-shrink-0 w-5 h-5 relative">
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="block w-3 h-px bg-gray-400" />
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
            isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`}>
            <span className="block w-px h-3 bg-gray-400" />
          </span>
        </span>
      </button>

      {/* Animated answer panel */}
      <div
        style={{ height, transition: 'height 0.3s ease' }}
        className="overflow-hidden"
      >
        <div
          ref={answerRef}
          className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4"
        >
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about the product and billing.
          </p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}  
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faqs;