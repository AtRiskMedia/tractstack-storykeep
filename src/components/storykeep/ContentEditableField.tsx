// ContentEditableField.tsx
import React, { useRef, useCallback, useEffect } from "react";

interface ContentEditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  onRevert?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const ContentEditableField: React.FC<ContentEditableFieldProps> = ({
  value,
  onChange,
  onRevert,
  placeholder = "",
  style = {},
}) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const setCursorPosition = useCallback(
    (element: HTMLElement, position: number) => {
      const range = document.createRange();
      const selection = window.getSelection();
      if (element.childNodes[0]) {
        range.setStart(
          element.childNodes[0],
          Math.min(position, element.childNodes[0].textContent?.length || 0)
        );
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    },
    []
  );

  const handleChange = useCallback(() => {
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        cursorPositionRef.current = range.startOffset;
      }

      const newValue = contentEditableRef.current.textContent || "";
      onChange(newValue);
    }
  }, [onChange]);

  useEffect(() => {
    if (
      contentEditableRef.current &&
      value !== contentEditableRef.current.textContent
    ) {
      contentEditableRef.current.textContent = value;
      setCursorPosition(contentEditableRef.current, cursorPositionRef.current);
      if (onRevert) {
        onRevert(value);
      }
    }
  }, [value, setCursorPosition, onRevert]);

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      onInput={handleChange}
      onBlur={handleChange}
      style={{
        ...style,
        minHeight: "1em",
      }}
      data-placeholder={placeholder}
    />
  );
};
