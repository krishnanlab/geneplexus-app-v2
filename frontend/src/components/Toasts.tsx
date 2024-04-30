import type { CSSProperties } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import classNames from "classnames";
import { atom, getDefaultStore, useAtom } from "jotai";
import { uniqueId } from "lodash";
import { sleep } from "@/util/misc";
import classes from "./Toasts.module.css";

/** available categories of toasts and associated styles */
const types = {
  info: { color: "var(--deep)", icon: <FaCircleInfo />, timeout: 5 },
  success: { color: "var(--success)", icon: <FaCircleCheck />, timeout: 3 },
  warning: {
    color: "var(--warning)",
    icon: <FaCircleExclamation />,
    timeout: 5,
  },
  error: {
    color: "var(--error)",
    icon: <FaTriangleExclamation />,
    timeout: 20,
  },
};

type Toast = {
  /** id/name to de-duplicate by */
  id: string;
  /** determines icon and style */
  type: keyof typeof types;
  /** content */
  text: string;
  /** close timer */
  timer: number;
};

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  const [getToasts] = useAtom(toasts);

  return (
    <div className={classes.list} role="region" aria-label="Notifications">
      {getToasts.map((toast, index) => (
        <div
          key={index}
          className={classNames(classes.toast, "card")}
          style={{ "--color": types[toast.type].color } as CSSProperties}
        >
          {types[toast.type].icon}
          <div role={toast.type === "error" ? "alert" : "status"}>
            {toast.text}
          </div>
          <button onClick={() => removeToast(toast.id)}>
            <FaXmark />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toasts;

/** global toasts */
const toasts = atom<Toast[]>([]);

/** add toast to end */
const addToast = (toast: Toast) => {
  removeToast(toast.id);
  const newToasts = getDefaultStore().get(toasts).concat([toast]);
  getDefaultStore().set(toasts, newToasts);
};

/** remove toast by id */
const removeToast = (id: Toast["id"]) => {
  const newToasts = getDefaultStore()
    .get(toasts)
    .filter((toast) => {
      const existing = toast.id === id;
      if (existing) window.clearTimeout(toast.timer);
      return !existing;
    });
  getDefaultStore().set(toasts, newToasts);
};

/** add toast to global queue */
const toast = async (
  text: Toast["text"],
  type: Toast["type"] = "info",
  id?: Toast["id"],
) => {
  /** make sure to set state outside of render */
  await sleep();

  /** timeout before close, in ms */
  const timeout = types[type].timeout * 1000 + (text.length - 30) * 100;

  const newToast = {
    id: id ?? uniqueId(),
    type: type ?? "info",
    text,
    timer: window.setTimeout(() => removeToast(newToast.id), timeout),
  };
  addToast(newToast);
};

export { toast };
