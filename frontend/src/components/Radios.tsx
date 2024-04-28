import type { ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import * as RAC from "react-aria-components";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import classNames from "classnames";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
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

type Props<O extends Option> = {
  /** label content */
  label: ReactNode;
  /** tooltip on help icon */
  tooltip?: ReactNode;
  /** pass with "as const" */
  options: readonly O[];
  /** selected option id */
  value?: O["id"];
  /** when selected option changes */
  onChange?: (value: O["id"]) => void;
  /** field name in form data */
  name?: string;
};

/**
 * group of mutually-exclusive options. only use for 2-4 very important options
 * that all need to be simultaneously visible, otherwise use select.
 */
const Radios = <O extends Option>({
  label,
  tooltip,
  options,
  value,
  onChange,
  name,
}: Props<O>) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <RAC.RadioGroup
      className={classes.container}
      value={value}
      onChange={onChange}
    >
      {({ state }) => (
        <>
          {/* auto-select first option if value not in options anymore */}
          {(() => {
            if (
              !options.find((option) => option.id === state.selectedValue) &&
              state.selectedValue !== options[0]!.id
            )
              state.setSelectedValue(options[0]!.id);
          })()}

          <RAC.Label className={classes.label}>
            {label}
            {tooltip && <Help tooltip={tooltip} />}
          </RAC.Label>

          <div className={classes.options}>
            {options.map((option, index) => (
              <RAC.Radio
                className={classes.option}
                key={index}
                value={option.id}
              >
                {({ isSelected }) => (
                  <>
                    {/* check */}
                    {isSelected ? (
                      <FaRegCircleDot
                        className={classNames(classes.check, classes.checked)}
                      />
                    ) : (
                      <FaRegCircle className={classes.check} />
                    )}

                    {/* text content */}
                    <div className={classes.text}>
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

                    {/* hidden input */}
                    {isSelected && (
                      <input
                        hidden
                        readOnly
                        name={name}
                        form={form}
                        value={option.id}
                      />
                    )}
                  </>
                )}
              </RAC.Radio>
            ))}
          </div>
        </>
      )}
    </RAC.RadioGroup>
  );
};

export default Radios;
