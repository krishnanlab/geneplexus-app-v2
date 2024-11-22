import { FaArrowRight, FaPlus, FaScroll } from "react-icons/fa6";
import screenshotPreds from "@/assets/preds.png";
import screenshotSims from "@/assets/sims.png";
import screenshotNetwork from "@/assets/screenshot-network.png";
import screenshotSpecies from "@/assets/species.png";
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
        </Flex>

        <p className="center">
          <Link to={import.meta.env.VITE_OLD_URL}>
            Looking for the old GenePlexus?
          </Link>
        </p>
      </Section>

      <Section>
        <Heading level={2}>Features</Heading>

        <Flex
          className={classes.feature}
          gap="lg"
          wrap={false}
          breakpoint={800}
          full
        >
          <div className={classes["feature-image"]}>
            <img src={screenshotPreds} alt="" />
          </div>
          <Flex direction="column">
            <strong>Genome-wide Predictions</strong>
            <p>
              A <b>custom model</b> trained on your genes lets you prioritize
              the gene list and predict gene assocaited with your gene list.
            </p>
          </Flex>
        </Flex>

        <Flex
          className={classes.feature}
          gap="lg"
          wrap={false}
          breakpoint={800}
          full
        >
          <div className={classes["feature-image"]}>
            <img src={screenshotSims} alt="" />
          </div>
          <Flex direction="column">
            <strong>Model Interpretability</strong>
            <p>
              Compare the user trained model to known biology.
            </p>
          </Flex>
        </Flex>

        <Flex
          className={classes.feature}
          gap="lg"
          wrap={false}
          breakpoint={800}
          full
        >
          <div className={classes["feature-image"]}>
            <img src={screenshotNetwork} alt="" />
          </div>
          <Flex direction="column">
            <strong>Interactive Network</strong>
            <p>
              View connections between your genes of different types and weights
              as an interactive network.
            </p>
          </Flex>
        </Flex>
		
        <Flex
          className={classes.feature}
          gap="lg"
          wrap={false}
          breakpoint={800}
          full
        >
          <div className={classes["feature-image"]}>
            <img src={screenshotSpecies} alt="" />
          </div>
          <Flex direction="column">
            <strong>Cross-species</strong>
            <p>
              View results in the same speices for which the model
			  is trained or seamlessly translate to another species.
            </p>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Heading level={2}>How it works</Heading>
        <p className="center">
          Under the hood, GenePlexus uses node emebddings from a six-species
		  network to build features for a machine learning model.
        </p>

        <Link
          to="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011773"
          showArrow={false}
        >
          <img
            src="https://journals.plos.org/ploscompbiol/article/figure/image?size=large&id=10.1371/journal.pcbi.1011773.g001"
            alt="Infographic figure from manuscript summarizing key points about GenePlexus: Six species network with over 100k genes. Within-species gene interactions + cross-species homology links. Project multi-species network into a joint feature space. Improves within-species prediction accuracy. Enables cross-species prediction."
          />
        </Link>

        <Button
          to="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011773"
          icon={<FaScroll />}
          text="Read the manuscript"
          flip
        />
      </Section>
    </>
  );
};

export default HomePage;
