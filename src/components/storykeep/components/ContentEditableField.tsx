import { useRef, useCallback, useEffect, useState } from "react";
import type { CSSProperties, KeyboardEvent, ClipboardEvent } from "react";

interface ContentEditableFieldProps {
  id: string;
  value: string;
  className?: string;
  onChange: (value: string) => boolean;
  onEditingChange: (editing: boolean) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => boolean;
  placeholder?: string;
  style?: CSSProperties;
}

const ContentEditableField = ({
  id,
  value,
  onChange,
  onEditingChange,
  onKeyDown,
  className,
  placeholder = "",
  style = {},
}: ContentEditableFieldProps) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number>(0);
  const [internalValue, setInternalValue] = useState(value);
  const isInitialMount = useRef(true);
  const [editing, setEditing] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (onKeyDown) {
        const shouldContinue = onKeyDown(event);
        if (!shouldContinue) {
          event.preventDefault();
        }
      }
    },
    [onKeyDown]
  );

  const handlePaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const sanitizedText = text
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    document.execCommand("insertText", false, sanitizedText);
  }, []);

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
      // this is needed to prevent race in the isEditing helpful info pop-ups
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
      onPaste={handlePaste}
      onKeyDown={onKeyDown ? handleKeyDown : undefined}
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
