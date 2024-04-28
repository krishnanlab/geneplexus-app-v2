import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import classNames from "classnames";
import Asterisk from "@/components/Asterisk";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./TextBox.module.css";

type Base = {
  /** layout of label and control */
  layout?: "vertical" | "horizontal";
  /** label content */
  label?: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** hint icon to show on side */
  icon?: ReactElement;
  /** text state */
  value?: string;
  /** on text state change */
  onChange?: (value: string) => void;
  /** className */
  className?: string;
};

type Single = {
  /** single line */
  multi?: false;
} & Pick<
  ComponentProps<"input">,
  "placeholder" | "type" | "autoComplete" | "name" | "required"
>;

type Multi = {
  /** multi-line */
  multi: true;
} & Pick<
  ComponentProps<"textarea">,
  "placeholder" | "autoComplete" | "name" | "required"
>;

type Props = Base & (Single | Multi);

/** single or multi-line text input box */
const TextBox = ({
  layout = "vertical",
  label,
  tooltip,
  multi,
  icon,
  value,
  onChange,
  className,
  ...props
}: Props) => {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  /** track whether input is blank */
  const [blank, setBlank] = useState(!value?.trim());

  /** unique id for component instance */
  const id = useId();

  /** side element */
  let sideElement: ReactNode = "";

  if (!blank || value)
    sideElement = (
      <button
        className={classes.side}
        type="button"
        onClick={() => {
          if (ref.current) ref.current.value = "";
          onChange?.("");
          setBlank(true);
        }}
        aria-label="Clear text"
      >
        <FaXmark />
      </button>
    );
  else if (icon) sideElement = <div className={classes.side}>{icon}</div>;

  /** link to parent form component */
  const form = useForm();

  /** input field */
  const input = multi ? (
    <textarea
      ref={ref}
      id={id}
      className={classes.textarea}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
        setBlank(!event.target.value);
      }}
      form={form}
      {...props}
    />
  ) : (
    <input
      ref={ref}
      id={id}
      className={classes.input}
      value={value}
      data-side={sideElement ? "" : undefined}
      onChange={(event) => {
        onChange?.(event.target.value);
        setBlank(!event.target.value);
      }}
      form={form}
      {...props}
    />
  );

  const isLabel = label || tooltip || props.required;

  return (
    <div
      className={classNames(classes.container, classes[layout], className)}
      style={{ display: isLabel ? "" : "contents" }}
    >
      {isLabel && (
        <label className={classes.label}>
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {props.required && <Asterisk />}
        </label>
      )}

      <div className={classes.wrapper}>
        {input}

        {/* side element */}
        {sideElement}
      </div>
    </div>
  );
};

export default TextBox;
