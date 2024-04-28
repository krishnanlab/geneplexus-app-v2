import type { ReactNode } from "react";
import * as RAC from "react-aria-components";
import { FaRegSquare, FaRegSquareCheck } from "react-icons/fa6";
import Asterisk from "@/components/Asterisk";
import { useForm } from "@/components/Form";
import Help from "@/components/Help";
import classes from "./CheckBox.module.css";

type Props = {
  /** label content */
  label: ReactNode;
  /** tooltip content */
  tooltip?: ReactNode;
  /** checked state */
  value?: boolean;
  /** on checked state change */
  onChange?: (value: boolean) => void;
  /** field name in form data */
  name?: string;
  /** whether must be checked for form to be submitted */
  required?: boolean;
};

/** obscure values to be able to distinguish boolean (checkbox) in FormData */
export const checkedValue = "__checkedValue__";
export const uncheckedValue = "__uncheckedValue__";

/** simple checkbox with label */
const CheckBox = ({
  label,
  tooltip,
  value,
  onChange,
  name,
  required,
}: Props) => {
  /** link to parent form component */
  const form = useForm();

  return (
    <RAC.Checkbox
      className={classes.container}
      isSelected={value}
      onChange={onChange}
    >
      {({ isSelected }) => (
        <>
          {isSelected ? (
            <FaRegSquareCheck className={classes.check} />
          ) : (
            <FaRegSquare className={classes.check} />
          )}
          {label}
          {tooltip && <Help tooltip={tooltip} />}
          {required && <Asterisk />}

          {/* for FormData */}
          {/* https://github.com/adobe/react-spectrum/issues/4117 */}
          <input
            type="checkbox"
            className="sr-only"
            tabIndex={-1}
            aria-hidden={true}
            value={isSelected ? checkedValue : uncheckedValue}
            checked={!(required && !isSelected)}
            onChange={() => null}
            required={required}
            form={form}
            name={name}
          />
        </>
      )}
    </RAC.Checkbox>
  );
};

export default CheckBox;
