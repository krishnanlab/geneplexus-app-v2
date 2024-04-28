import { FaAsterisk } from "react-icons/fa6";
import Tooltip from "@/components/Tooltip";
import classes from "./Asterisk.module.css";

/** asterisk for things like required form fields */
const Asterisk = () => (
  <Tooltip content="Required">
    <FaAsterisk className={classes.asterisk} />
  </Tooltip>
);

export default Asterisk;
