import { FaArrowRight, FaFlaskVial, FaPlus } from "react-icons/fa6";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import classes from "./Home.module.css";

const HomePage = () => {
  return (
    <>
      <Meta title="Home" />

      <Section fill>
        <Heading level={1} className="sr-only">
          Home
        </Heading>

        <p className={classes.hero}>{import.meta.env.VITE_DESCRIPTION}</p>

        <Flex>
          <Button to="/new-analysis" text="New Analysis" icon={<FaPlus />} />
          <Button
            to="/load-analysis"
            text="Load Analysis"
            icon={<FaArrowRight />}
          />
          <Button to="/testbed" text="Testbed" icon={<FaFlaskVial />} />
        </Flex>

        <p className="center">
          <Link to={import.meta.env.VITE_OLD_URL}>
            Looking for the old GenePlexus?
          </Link>
        </p>
      </Section>

      <Section>
        <p>
          GenePlexus trains a custom model on your gene set to predict new
          genes, compare to known processes and phenotypes, and view network
          connections.
        </p>
      </Section>
    </>
  );
};

export default HomePage;
