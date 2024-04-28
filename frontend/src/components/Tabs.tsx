import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";
import * as RAC from "react-aria-components";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames";
import { kebabCase } from "lodash";
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
  const tabProps = (Array.isArray(children) ? children : [children])
    .filter((child): child is ReactElement => !!child)
    .map((child) => ({
      ...child.props,
      /** make unique tab id from text */
      id: kebabCase(child.props.text),
    }));

  defaultValue ??= tabProps[0]?.id;

  /** sync selected tab with url */
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <RAC.Tabs
      className={classes.container}
      selectedKey={searchParams.get(syncWithUrl)}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(value) =>
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
      <RAC.TabList className="flex-row gap-sm">
        {tabProps.map((tab, index) => (
          <Tooltip key={index} content={tab.tooltip}>
            <RAC.Tab
              id={tab.id}
              className={classNames(classes.button, "flex-row", "gap-xs")}
            >
              {tab.text}
              {tab.icon}
            </RAC.Tab>
          </Tooltip>
        ))}
      </RAC.TabList>

      {/* panels */}
      {tabProps.map((tab, index) => (
        <RAC.TabPanel
          key={index}
          id={tab.id}
          className={classNames("flex-col", "gap-lg", classes.content)}
        >
          {tab.children}
        </RAC.TabPanel>
      ))}
    </RAC.Tabs>
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
