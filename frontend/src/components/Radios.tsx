import type { ReactElement, ReactNode } from "react";
import { cloneElement, useEffect, useId } from "react";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import * as radio from "@zag-js/radio-group";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useForm } from "@/components/Form";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import classes from "./Radios.module.css";

export type Option<ID = string> = {
  /** unique id */
  id: ID;
  /** primary content */
  primary: ReactNode;
  /** secondary content */
  secondary?: ReactNode;
  /** tertiary content */
  tertiary?: ReactNode;
  /** icon next to content */
  icon?: ReactElement;
};

type Base<O extends Option> = {
  /** selected option id */
  value?: O["id"];
  /** when selected option changes */
  onChange?: (value: O["id"]) => void;
  /** pass with "as const" */
  options: readonly O[];
  /** field name */
  name?: string;
};

type Props<O extends Option> = Base<O> & LabelProps;

/**
 * group of mutually-exclusive options. only use for 2-4 very important options
 * that all need to be simultaneously visible, otherwise use select.
 */
const Radios = <O extends Option>({
  value,
  onChange,
  options,
  name,
  ...props
}: Props<O>) => {
  /** set up zag */
  const [state, send] = useMachine(
    radio.machine({
      /** unique id for component instance */
      id: useId(),
      /** link field and form */
      name,
      form: useForm(),
    }),
    /** https://zagjs.com/overview/programmatic-control#controlled-usage-in-reacts */
    {
      context: {
        /** initialize selected value state */
        value: String(value || options[0]?.id || 0),
        /** when selected value changes */
        onValueChange: (details) => onChange?.(details.value),
      },
    },
  );

  /** interact with zag */
  const api = radio.connect(state, send, normalizeProps);

  /** auto-select first option if value not in options anymore */
  useEffect(() => {
    if (!options.find((option) => option.id === api.value))
      api.setValue(options[0]!.id);
  });

  /** check icon */
  const Check = ({ selected = false, ...props }) =>
    selected ? <FaRegCircleDot {...props} /> : <FaRegCircle {...props} />;

  return (
    <Label
      {...api.labelProps}
      {...forwardLabelProps(props, api.rootProps.id)}
      layout="vertical"
      width="unset"
    >
      <div {...api.rootProps} className={classes.list}>
        {options.map((option) => (
          <label
            key={option.id}
            {...api.getItemProps({ value: option.id })}
            className={classes.option}
          >
            {/* check */}
            <Check
              className={classes.check}
              selected={option.id === api.value}
              {...api.getItemControlProps({ value: option.id })}
            />

            {/* text content */}
            <div
              className={classes.text}
              {...api.getItemTextProps({ value: option.id })}
            >
              <span className="primary">{option.primary}</span>
              {option.secondary && (
                <span className="secondary">{option.secondary}</span>
              )}
              {option.tertiary && (
                <span className="secondary">{option.tertiary}</span>
              )}
            </div>

            {/* icon */}
            {option.icon &&
              cloneElement(option.icon, { className: classes.icon })}

            <input {...api.getItemHiddenInputProps({ value: option.id })} />
          </label>
        ))}
      </div>
    </Label>
  );
};

export default Radios;
