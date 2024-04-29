import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";
import { kebabCase } from "lodash";
import * as Radix from "@radix-ui/react-tabs";
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
  const tabs = (Array.isArray(children) ? children : [children])
    .filter((child): child is ReactElement => !!child)
    .map((child) => ({
      ...child.props,
      /** make unique tab id from text */
      id: kebabCase(child.props.text),
    }));

  defaultValue ??= tabs[0]?.id;

  /** sync selected tab with url */
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Radix.Root
      className={classes.root}
      defaultValue={searchParams.get(syncWithUrl) ?? defaultValue}
      onValueChange={(value) =>
        setSearchParams(
          (prev) => {
            prev.set(syncWithUrl, String(value));
            return prev;
          },
          { replace: true },
        )
      }
    >
      {/* tab buttons */}
      <Radix.List className="flex-row gap-sm">
        {tabs.map((tab, index) => (
          <Tooltip key={index} content={tab.tooltip}>
            <Radix.Trigger
              value={tab.id}
              className={classNames(classes.button, "flex-row", "gap-xs")}
            >
              {tab.text}
              {tab.icon}
            </Radix.Trigger>
          </Tooltip>
        ))}
      </Radix.List>

      {/* panels */}
      {tabs.map((tab, index) => (
        <Radix.Content
          key={index}
          value={tab.id}
          className={classNames("flex-col", "gap-lg", classes.content)}
        >
          {tab.children}
        </Radix.Content>
      ))}
    </Radix.Root>
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
  /** tab panel content */
  children: ReactNode;
};

/** use within a Tabs component */
const Tab = (props: TabProps) => {
  return <Fragment {...props} />;
};

export { Tab };
