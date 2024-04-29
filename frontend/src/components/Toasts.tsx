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
  /** close timer */
  timer: number;
};

/** list of "toasts" (notifications) in corner of screen. singleton. */
const Toasts = () => {
  const [getToasts] = useAtom(toasts);

  return (
    <div className={classes.list}>
      {getToasts.map((toast, index) => (
        <div
          key={index}
          className={classNames(classes.toast, "card")}
          style={{ "--color": types[toast.type].color } as CSSProperties}
        >
          {types[toast.type].icon}
          <div role="alert">{toast.text}</div>
          <button>
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
  type?: Toast["type"],
  id?: Toast["id"],
  /** timeout before close, in ms */
  timeout = 5000,
) => {
  const newToast = {
    id: id ?? uniqueId(),
    type: type ?? "info",
    text,
    timer: window.setTimeout(() => removeToast(newToast.id), timeout),
  };
  addToast(newToast);
};

export { toast };
