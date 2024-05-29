import type { ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";
import classNames from "classnames";
import Tooltip from "@/components/Tooltip";
import classes from "./Link.module.css";

type Props = {
  /** url to link to, local or external */
  to: string;
  /** force link to open in new tab */
  newTab?: boolean;
  /** disable arrow icon */
  noIcon?: boolean;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class */
  className?: string;
  /** content */
  children: ReactNode;
};

/** link to internal route or external url */
const Link = forwardRef(
  (
    { to, children, newTab, noIcon, tooltip, className, ...props }: Props,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    /** whether link is external (some other site) or internal (within router) */
    const external = to.startsWith("http");

    /** whether to open link in new tab */
    const target = newTab ?? external ? "_blank" : "";

    /** whether to show icon */
    const showIcon = target && !noIcon;

    /** full element to render */
    const element = external ? (
      <a
        ref={ref}
        href={to}
        target={target}
        className={classNames(classes.link, className)}
        {...props}
      >
        {children}
        {showIcon && <FaArrowUpRightFromSquare className={classes.icon} />}
      </a>
    ) : (
      <RouterLink
        ref={ref}
        to={to}
        target={target}
        className={classNames(classes.link, className)}
        {...props}
      >
        {children}
        {showIcon && <FaArrowUpRightFromSquare className={classes.icon} />}
      </RouterLink>
    );

    return <Tooltip content={tooltip}>{element}</Tooltip>;
  },
);

export default Link;
