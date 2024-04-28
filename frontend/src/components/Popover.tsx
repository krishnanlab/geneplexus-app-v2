import type { ReactElement, ReactNode } from "react";
import * as RAC from "react-aria-components";
import classes from "./Popover.module.css";

type Props = {
  /** content of popup */
  content: ReactNode;
  /** trigger (must be RAC Button) */
  children: ReactElement;
};

/**
 * popup of interactive content when hovering or focusing children. for use in
 * other components, not directly.
 */
const Popover = ({ content, children }: Props) => {
  return (
    <RAC.DialogTrigger>
      {children}
      <RAC.Popover className={classes.content}>
        <RAC.OverlayArrow className={classes.arrow} />
        <RAC.Dialog>{content}</RAC.Dialog>
      </RAC.Popover>
    </RAC.DialogTrigger>
  );
};

export default Popover;
