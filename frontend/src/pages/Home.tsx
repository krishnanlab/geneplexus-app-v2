import { FaArrowRight, FaFlaskVial, FaPlus } from "react-icons/fa6";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import classes from "./Home.module.css";

const Home = () => {
  return (
    <>
      <Meta title="Home" />

      <Section fill={true}>
        <Heading level={1} className="sr-only">
          Home
        </Heading>

        <p className={classes.hero}>{import.meta.env.VITE_DESCRIPTION}</p>
        <div className="flex-row gap-sm">
          <Button
            to="/new-analysis"
            text="New Analysis"
            icon={<FaPlus />}
            design="accent"
          />
          <Button
            to="/analysis"
            text="Load Analysis"
            icon={<FaArrowRight />}
            design="accent"
          />
          <Button
            to="/testbed"
            text="Testbed"
            icon={<FaFlaskVial />}
            design="accent"
          />
        </div>
      </Section>
    </>
  );
};

export default Home;
