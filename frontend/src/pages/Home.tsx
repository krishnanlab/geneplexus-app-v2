import { FaArrowRight, FaFlaskVial, FaPlus } from "react-icons/fa6";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
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
          <Button to="/analysis" text="Load Analysis" icon={<FaArrowRight />} />
          <Button to="/testbed" text="Testbed" icon={<FaFlaskVial />} />
        </Flex>
      </Section>

      <Section>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Section>
    </>
  );
};

export default HomePage;
