import React, { useEffect, useRef, forwardRef, useLayoutEffect } from "react";
import { Jodit } from "./include.jodit";

interface JoditEditorProps {
  className?: string;
  config?: object;
  id?: string;
  name?: string;
  onBlur?: (
    value: string,
    event: React.FocusEvent<HTMLTextAreaElement>,
  ) => void;
  onChange?: (value: string) => void;
  tabIndex?: number;
  value?: string;
  editorRef?: (editor: JoditEditorInstance | null) => void;
}

interface JoditEditorInstance {
  value: string;
  isReady: boolean;
  waitForReady: () => Promise<void>;
  destruct: () => void;
  events: {
    on: (event: string, handler: Function) => void;
    off: (event: string, handler: Function) => void;
  };
}

const JoditEditor = forwardRef<HTMLTextAreaElement, JoditEditorProps>(
  (
    {
      className,
      config,
      id,
      name,
      onBlur,
      onChange,
      tabIndex,
      value,
      editorRef,
    },
    ref,
  ) => {
    const textArea = useRef<HTMLTextAreaElement | null>(null);
    const joditInstanceRef = useRef<JoditEditorInstance | null>(null);

    useLayoutEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(textArea.current);
        } else if (ref && "current" in ref) {
          ref.current = textArea.current;
        }
      }
    }, [textArea, ref]);

    useEffect(() => {
      const element = textArea.current;
      if (element) {
        joditInstanceRef.current = Jodit.make(
          element,
          config,
        ) as unknown as JoditEditorInstance;
        if (typeof editorRef === "function") {
          editorRef(joditInstanceRef.current);
        }

        return () => {
          joditInstanceRef.current?.destruct();
        };
      }
    }, [config, editorRef]);

    useEffect(() => {
      if (textArea.current) {
        textArea.current.tabIndex = tabIndex || -1;
      }
    }, [tabIndex]);

    useEffect(() => {
      const onBlurHandler = (e: Event) => {
        if (onBlur && joditInstanceRef.current) {
          const focusEvent =
            e as unknown as React.FocusEvent<HTMLTextAreaElement>;
          onBlur(joditInstanceRef.current.value, focusEvent);
        }
      };

      const onChangeHandler = (newValue: string) => {
        if (onChange) {
          onChange(newValue);
        }
      };

      if (joditInstanceRef.current) {
        joditInstanceRef.current.events.on("blur", onBlurHandler);
        joditInstanceRef.current.events.on("change", onChangeHandler);
      }

      return () => {
        if (joditInstanceRef.current && joditInstanceRef.current.events) {
          joditInstanceRef.current.events.off("blur", onBlurHandler);
          joditInstanceRef.current.events.off("change", onChangeHandler);
        }
        // else {
        //     console.warn('joditInstance or joditInstance.events is undefined');
        // }
      };
    }, [onBlur, onChange]);

    useEffect(() => {
      if (
        joditInstanceRef.current &&
        textArea.current &&
        textArea.current.value !== value
      ) {
        joditInstanceRef.current.value = value!;
      }
    }, [value]);

    return (
      <div className={`${className || ""}`}>
        <textarea
          value={value}
          name={name}
          id={id}
          ref={textArea}
          placeholder="Enter question here..."
          onChange={() => {}}
        />
      </div>
    );
  },
);

JoditEditor.displayName = "JoditEditor";

export default JoditEditor;
