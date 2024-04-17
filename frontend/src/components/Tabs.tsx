import type { ReactElement, ReactNode } from "react";
import { Fragment, useId } from "react";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";
import { kebabCase } from "lodash";
import { normalizeProps, useMachine } from "@zag-js/react";
import * as tabs from "@zag-js/tabs";
import Tooltip from "@/components/Tooltip";
import classes from "./Tabs.module.css";

type Props = {
  /**
   * keep selected tab synced with url param of this name (leave undefined for
   * no sync)
   */
  syncWithUrl?: string;
  /** series of Tab components */
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
  /** starting selected tab id (defaults to first tab) */
  defaultValue?: string;
};

const Tabs = ({ syncWithUrl = "", children, defaultValue }: Props) => {
  /** tab props */
  const tabProps = [children]
    .flat()
    .filter((child): child is ReactElement => !!child)
    .map((child) => ({
      ...child.props,
      /** make unique tab id from text */
      id: kebabCase(child.props.text),
    }));

  defaultValue ??= tabProps[0]?.id;

  /** sync selected tab with url */
  const [searchParams, setSearchParams] = useSearchParams();

  /** set up zag */
  const [state, send] = useMachine(
    tabs.machine({
      /** unique id for component instance */
      id: useId(),
      value: defaultValue,
    }),
    /** https://zagjs.com/overview/programmatic-control#controlled-usage-in-reacts */
    {
      context: syncWithUrl
        ? {
            /** initialize selected tab state */
            value: searchParams.get(syncWithUrl) ?? defaultValue,
            /** when selected tab changes */
            onValueChange: (details) =>
              /** note: https://github.com/remix-run/react-router/issues/8393 */
              setSearchParams(
                (prev) => {
                  prev.set(syncWithUrl, details.value);
                  return prev;
                },
                { replace: true },
              ),
          }
        : undefined,
    },
  );

  /** interact with zag */
  const api = tabs.connect(state, send, normalizeProps);

  return (
    <div {...api.rootProps} className={classes.container}>
      {/* list */}
      <div {...api.listProps} className="flex-row gap-sm">
        {tabProps.map((tab, index) => (
          <Tooltip key={index} content={tab.tooltip}>
            <button
              {...api.getTriggerProps({ value: tab.id })}
              className={classes.button}
              type="button"
            >
              {tab.text}
              {tab.icon}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* panels */}
      {tabProps.map((tab, index) => (
        <div
          key={index}
          {...api.getContentProps({ value: tab.id })}
          className={classNames(
            "flex-col",
            "gap-md",
            classes.content,
            tab.className,
          )}
        >
          {tab.children}
        </div>
      ))}
    </div>
  );
};

export default Tabs;

type TabProps = {
  /**
   * tab button text. should be unique to avoid user confusion, and because
   * kebab-cased to create unique id.
   */
  text: string;
  /** tab button icon */
  icon?: ReactElement;
  /** tab button tooltip content */
  tooltip?: ReactNode;
  /** class on panel content container */
  className?: string;
  /** tab panel content */
  children: ReactNode;
};

/** use within a Tabs component */
const Tab = (props: TabProps) => {
  return <Fragment {...props} />;
};

export { Tab };
