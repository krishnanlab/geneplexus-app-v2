import type { ReactElement, ReactNode } from "react";
import * as Radix from "@radix-ui/react-tooltip";
import { shrinkWrap } from "@/util/dom";
import classes from "./Tooltip.module.css";

type Props = {
  /**
   * content of popup. use raw string for plain text, <>react element for
   * <strong>rich text</strong></>.
   */
  content?: ReactNode;
  /** trigger */
  children: ReactElement;
};

/**
 * popup of minimal, non-interactive help or contextual info when hovering or
 * focusing children. for use in other components, not directly.
 */
const Tooltip = ({ content, children }: Props) => {
  if (content)
    return (
      <Radix.Provider delayDuration={200}>
        <Radix.Root>
          <Radix.Trigger asChild>{children}</Radix.Trigger>
          <Radix.Portal>
            <Radix.Content
              ref={(element) => {
                shrinkWrap(element);
                return element;
              }}
              className={classes.content}
            >
              {content}
              <Radix.Arrow className={classes.arrow} />
            </Radix.Content>
          </Radix.Portal>
        </Radix.Root>
      </Radix.Provider>
    );
  else return children;
};

export default Tooltip;
