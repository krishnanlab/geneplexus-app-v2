import type { CSSProperties } from "react";
import { useRef } from "react";
import * as RAC from "react-aria-components";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import classNames from "classnames";
import { uniqueId } from "lodash";
import { useToast, useToastRegion } from "@react-aria/toast";
import { ToastQueue, useToastQueue } from "@react-stately/toast";
import type { QueuedToast, ToastState } from "@react-stately/toast";
import Loading from "@/assets/loading.svg?react";
import classes from "./Toasts.module.css";

/** available categories of toasts and associated styles */
const types = {
  info: { color: "var(--deep)", icon: <FaCircleInfo /> },
  loading: { color: "var(--deep)", icon: <Loading /> },
  success: { color: "var(--success)", icon: <FaCircleCheck /> },
  warning: { color: "var(--warning)", icon: <FaCircleExclamation /> },
  error: { color: "var(--error)", icon: <FaTriangleExclamation /> },
};

type Toast = {
  /** id/name to de-duplicate by */
  id: string;
  /** determines icon and style */
  type: keyof typeof types;
  /** content */
  text: string;
};

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  const ref = useRef(null);

  /** toasts state */
  const state = useToastQueue<Toast>(toasts);
  const { regionProps } = useToastRegion({}, state, ref);

  return (
    <div ref={ref} {...regionProps} className={classes.list}>
      {state.visibleToasts.toReversed().map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
};

export default Toasts;

type Props = {
  toast: QueuedToast<Toast>;
  state: ToastState<Toast>;
};

/** individual toast */
const Toast = ({ state, toast }: Props) => {
  const ref = useRef(null);

  /** toast state */
  const { toastProps, titleProps, closeButtonProps } = useToast(
    { toast },
    state,
    ref,
  );

  /** toast details */
  const {
    content: { type, text },
  } = toast;

  return (
    <div
      ref={ref}
      {...toastProps}
      className={classNames(classes.toast, "card")}
      style={{ "--color": types[type].color } as CSSProperties}
    >
      {types[type].icon}
      <div {...titleProps}>{text}</div>
      <RAC.Button {...closeButtonProps}>
        <FaXmark />
      </RAC.Button>
    </div>
  );
};

/** global toasts */
const toasts = new ToastQueue<Toast>({ maxVisibleToasts: 5 });

/** add toast to global queue */
const makeToast = async (
  text: Toast["text"],
  type?: Toast["type"],
  id?: Toast["id"],
) => {
  toasts.visibleToasts
    .filter((toast) => toast.content.id === id)
    .forEach((toast) => toasts.close(toast.key));
  toasts.add(
    { id: id ?? uniqueId(), type: type ?? "info", text },
    { timeout: 5000 },
  );
};

export { makeToast as toast };
