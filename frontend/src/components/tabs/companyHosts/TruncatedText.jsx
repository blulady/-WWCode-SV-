import React, { useState, useRef, useEffect } from "react";
import styles from "./TruncatedText.module.css";

const TruncatedText = ({ text, maxLines = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef(null);


  // useEffect(() => {
  //   if (contentRef.current) {
  //     const isOverFlowing =
  //       contentRef.current.scrollHeight > contentRef.current.clientHeight;
  //     console.log(contentRef.current.scrollWidth);
  //     setIsTruncated(isOverFlowing);
  //   }
  // }, [contentRef]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        ref={contentRef}
        className={`${isExpanded ? styles["expanded"] : styles["text-container"]}`}
        onClick={toggleExpanded}
      >
        {text}
      </div>
    </div>
  );
};

export default TruncatedText;
