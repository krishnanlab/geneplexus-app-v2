import { useId, useState } from "react";
import { normalizeProps, useMachine } from "@zag-js/react";
import * as slider from "@zag-js/slider";
import { useForm } from "@/components/Form";
import type { LabelProps } from "@/components/Label";
import Label, { forwardLabelProps } from "@/components/Label";
import { renderText } from "@/util/dom";
import { formatNumber } from "@/util/string";
import classes from "./Slider.module.css";

type Base = {
  /** min value */
  min?: number;
  /** max value */
  max?: number;
  /** inc/dec interval */
  step?: number;
  /** field name */
  name?: string;
};

type Single = {
  /** single value */
  multi?: false;
  /** number state */
  value?: number;
  /** on number state change */
  onChange?: (value: number) => void;
};

type Multi = {
  /** multiple values (range) */
  multi: true;
  /** numbers state */
  value?: number[];
  /** on numbers state change */
  onChange?: (value: number[]) => void;
};

type Props = Base & LabelProps & (Single | Multi);

/**
 * single or multi-value number slider. use for numeric values that need quick
 * or imprecise adjustment.
 */
const Slider = ({
  min,
  max,
  step,
  multi,
  value,
  onChange,
  name,
  ...props
}: Props) => {
  /** focused index */
  const [focused, setFocused] = useState(-1);

  /** defaults */
  const _min = min ?? 0;
  const _max = max ?? 100;
  const _step = Math.min(step ?? 1, _max - _min);

  /** set up zag */
  const [state, send] = useMachine(
    slider.machine({
      /** unique id for component instance */
      id: useId(),
      /** link field to form */
      name,
      form: useForm(),
      /** when focused thumb changes */
      onFocusChange: (details) => setFocused(details.focusedIndex),
    }),
    /** https://zagjs.com/overview/programmatic-control#controlled-usage-in-reacts */
    {
      context: {
        /** slider props */
        minStepsBetweenThumbs: _step,
        min: _min,
        max: _max,
        step: _step,
        /** initialize value state */
        value: multi
          ? value === undefined
            ? [_min, _max]
            : value
          : value === undefined
            ? [_min]
            : [value],
        /** when value changes */
        onValueChange: (details) => {
          if (multi) onChange?.(details.value);
          else details.value[0] && onChange?.(details.value[0]);
        },
      },
    },
  );

  /** interact with zag */
  const api = slider.connect(state, send, normalizeProps);

  /** whether to show min/max marks */
  const active = api.isFocused || api.isDragging;

  return (
    <Label {...forwardLabelProps(props, api.rootProps.id)}>
      <div {...api.rootProps} className={classes.container}>
        <div {...api.controlProps} className={classes.control}>
          {/* track */}
          <div {...api.trackProps} className={classes.track}>
            <div {...api.rangeProps} className={classes.range} />
          </div>

          {/* thumbs */}
          {api.value.map((_, index) => (
            <div
              key={index}
              {...api.getThumbProps({ index })}
              className={classes.thumb}
              aria-label={renderText(props.label || "") + " " + index}
            >
              <input {...api.getHiddenInputProps({ index })} name={name} />
            </div>
          ))}
        </div>

        {/* marks */}
        <div {...api.markerGroupProps} className={classes.markers}>
          {/* min value */}
          {active && (
            <span
              {...api.getMarkerProps({ value: _min })}
              className={classes["back-marker"]}
            >
              {formatNumber(_min, true)}
            </span>
          )}
          {/* max value */}
          {active && (
            <span
              {...api.getMarkerProps({ value: _max })}
              className={classes["back-marker"]}
            >
              {formatNumber(_max, true)}
            </span>
          )}

          {/* thumb values */}
          {api.value.map((value, index) => (
            <span
              key={index}
              className={classes.marker}
              {...api.getMarkerProps({ value })}
              data-faded={
                focused !== -1
                  ? focused === index
                    ? undefined
                    : "half"
                  : undefined
              }
            >
              {formatNumber(value, true)}
            </span>
          ))}
        </div>
      </div>
    </Label>
  );
};

export default Slider;
