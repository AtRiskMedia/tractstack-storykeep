import { useRef, useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface ContentEditableFieldProps {
  id: string;
  value: string;
  className?: string;
  onChange: (value: string) => boolean;
  onEditingChange: (editing: boolean) => void;
  placeholder?: string;
  style?: CSSProperties;
}

const ContentEditableField = ({
  id,
  value,
  onChange,
  onEditingChange,
  className,
  placeholder = "",
  style = {},
}: ContentEditableFieldProps) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number>(0);
  const [internalValue, setInternalValue] = useState(value);
  const isInitialMount = useRef(true);
  const [editing, setEditing] = useState(false);

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

  const handleContentChange = useCallback(() => {
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        cursorPositionRef.current = range.startOffset;
      }
      const newValue = contentEditableRef.current.textContent || "";
      const isValid = onChange(newValue);
      if (isValid) {
        setInternalValue(newValue);
      } else {
        // Revert to the previous valid state
        contentEditableRef.current.textContent = internalValue;
        setCursorPosition(
          contentEditableRef.current,
          cursorPositionRef.current
        );
      }
    }
  }, [onChange, internalValue, setCursorPosition]);

  const handleFocus = useCallback(() => {
    onEditingChange?.(true);
  }, [onEditingChange]);

  const handleBlur = useCallback(() => {
    onEditingChange?.(false);
  }, [onEditingChange]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = value;
      }
    } else if (
      contentEditableRef.current &&
      value !== contentEditableRef.current.textContent
    ) {
      contentEditableRef.current.textContent = value;
      setCursorPosition(contentEditableRef.current, cursorPositionRef.current);
    }
    setInternalValue(value);
  }, [value, setCursorPosition]);

  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        setEditing(false);
        onEditingChange(false);
      }, 100); // 100ms delay
    };

    const element = contentEditableRef.current;
    if (element) {
      element.addEventListener("blur", handleBlur);
    }

    return () => {
      if (element) {
        element.removeEventListener("blur", handleBlur);
      }
    };
  }, [onEditingChange]);

  return (
    <div
      id={id}
      ref={contentEditableRef}
      contentEditable
      onInput={handleContentChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        ...style,
        minHeight: "1em",
        pointerEvents: editing ? "none" : "auto",
      }}
      className={className || ``}
      data-placeholder={placeholder}
      role="textbox"
      aria-labelledby={`${id}-label`}
    />
  );
};

export default ContentEditableField;
