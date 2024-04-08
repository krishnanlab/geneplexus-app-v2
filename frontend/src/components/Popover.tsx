import type { ComponentRef, ReactElement, ReactNode } from "react";
import { cloneElement, useEffect, useId, useRef } from "react";
import classNames from "classnames";
import * as popover from "@zag-js/popover";
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react";
import Tooltip from "@/components/Tooltip";
import { sleep } from "@/util/misc";
import classes from "./Popover.module.css";

type Props = {
  /** title of popover */
  label: string;
  /** content of popup */
  content: ReactNode;
  /** trigger */
  children: ReactElement;
};

/**
 * popup of interactive content when hovering or focusing children. for use in
 * other components, not directly.
 */
const Popover = ({ label, content, children }: Props) => {
  const tooltip = useRef<ComponentRef<typeof Tooltip>>(null);

  /** set up zag */
  const [state, send] = useMachine(
    popover.machine({
      /** unique id for component instance */
      id: useId(),
      /** settings */
      positioning: {
        placement: "top",
      },
      /** close tooltip */
      onOpenChange: async () => {
        await sleep(10);
        tooltip.current?.close();
      },
    }),
  );

  /** interact with zag */
  const api = popover.connect(state, send, normalizeProps);

  /** force reposition after every render (change to contents) */
  useEffect(() => {
    api.reposition();
  });

  return (
    <>
      <Tooltip ref={tooltip} content={label} id={api.triggerProps.id}>
        {/* children elements that trigger opening on hover/focus */}
        {cloneElement(
          children,
          mergeProps(
            /** pass props necessary to trigger */
            api.triggerProps,
            /** make sure original props preserved */
            children.props,
          ),
        )}
      </Tooltip>

      {/* popup */}
      <Portal>
        {api.isOpen && (
          <div {...api.positionerProps} className={classes.popup}>
            {/* content */}
            <div
              {...api.contentProps}
              className={classNames(classes.content, "card")}
            >
              <div
                {...api.titleProps}
                className={classNames(
                  classes.label,
                  "primary",
                  "bold",
                  "sr-only",
                )}
              >
                {label}
              </div>
              {/* <button {...api.closeTriggerProps} className={classes.close}>
                <FaXmark />
              </button> */}
              {content}
            </div>

            {/* caret */}
            <div {...api.arrowProps} className={classes.arrow}>
              <div {...api.arrowTipProps} />
            </div>
          </div>
        )}
      </Portal>
    </>
  );
};

export default Popover;
