import { FaEnvelope, FaGithub } from "react-icons/fa6";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import classes from "./Footer.module.css";

/** at bottom of every page. singleton. */
const Footer = () => (
  <Flex tag="footer" direction="column" gap="sm" className={classes.footer}>
    <Flex gap="sm" className={classes.icons}>
      <Link
        to="mailto:arjun.krishnan@cuanschutz.edu"
        showArrow={false}
        tooltip="Email us"
      >
        <FaEnvelope />
      </Link>
      <Link
        to="https://github.com/krishnanlab"
        showArrow={false}
        tooltip="GitHub"
      >
        <FaGithub />
      </Link>
      <Link to="/about#terms-of-use">Terms of Use</Link>
      <Link
        to="https://pygeneplexus.readthedocs.io/en/v2.0.1/appendix/license.html"
        showArrow={false}
      >
        License
      </Link>
    </Flex>

    <Flex gap="sm" className={classes.icons}>
      <div>
        A project of the{" "}
        <Link to="https://www.thekrishnanlab.org" showArrow={false}>
          Krishnan Lab
        </Link>{" "}
        &copy; 2024
      </div>
    </Flex>
  </Flex>
);

export default Footer;
