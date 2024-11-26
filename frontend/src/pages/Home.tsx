import { FaArrowRight, FaPlus } from "react-icons/fa6";
import highlightNetwork from "@/assets/highlight-network.png";
import highlightPredictions from "@/assets/highlight-predictions.png";
import highlightSimilarities from "@/assets/highlight-similarities.png";
import highlightSpecies from "@/assets/highlight-species.png";
import overview from "@/assets/overview.png";
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
            <img src={highlightPredictions} alt="" />
          </div>
          <Flex direction="column">
            <strong>Genome-wide Predictions</strong>
            <p>
              A <b>custom model</b> trained on your gene list lets you
              prioritize it and predict other genes associated with it.
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
            <img src={highlightSimilarities} alt="" />
          </div>
          <Flex direction="column">
            <strong>Model Interpretability</strong>
            <p>
              Compare the custom trained model to known biological processes and
              phenotypes.
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
            <img src={highlightNetwork} alt="" />
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
            <img src={highlightSpecies} alt="" />
          </div>
          <Flex direction="column">
            <strong>Cross-species</strong>
            <p>
              View results in the same species the model is trained for or
              seamlessly translate to another species.
            </p>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Heading level={2}>How it works</Heading>
        <p className="center">
          Under the hood, GenePlexus uses sophisticated methods to analyze
          users' input genes. Node embeddings from a six-species network are
          used to build features for a custom machine learning model.{" "}
          <Link to="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011773">
            Learn more in the manuscript
          </Link>
          .
        </p>

        <Link
          to="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011773"
          showArrow={false}
        >
          <img
            src={overview}
            alt="Infographic figure from manuscript summarizing key points about GenePlexus: Six species network with over 100k genes. Within-species gene interactions + cross-species homology links. Project multi-species network into a joint feature space. Improves within-species prediction accuracy. Enables cross-species prediction."
          />
        </Link>
      </Section>
    </>
  );
};

export default HomePage;
