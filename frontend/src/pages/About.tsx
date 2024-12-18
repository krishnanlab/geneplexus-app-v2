import {
  FaArrowUpRightFromSquare,
  FaBook,
  FaBoxOpen,
  FaChartBar,
  FaEye,
  FaHourglass,
  FaLightbulb,
  FaPenNib,
  FaQuestion,
  FaRegCircleQuestion,
  FaScaleBalanced,
  FaScroll,
} from "react-icons/fa6";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const AboutPage = () => {
  return (
    <>
      <Meta title="About" />

      <Section>
        <Heading level={1} icon={<FaPenNib />}>
          About
        </Heading>
      </Section>

      <Section>
        <Heading level={2} icon={<FaEye />}>
          Overview
        </Heading>

        <Flex direction="column">
          <p>
            Browse the <Link to="/">Home page</Link> to get a high-level idea of
            what this web app does. Try the{" "}
            <b>
              Example <FaLightbulb />
            </b>{" "}
            button on the <Link to="/new-analysis">New Analysis page</Link> to
            quickly get started exploring. Look for in-situ help{" "}
            <FaRegCircleQuestion /> icons and{" "}
            <b>
              Learn more <FaArrowUpRightFromSquare />
            </b>{" "}
            links for detailed help selecting inputs, choosing options, and
            interpreting results.
          </p>

          <p>
            This web app is the primary way to use GenePlexus, but it is made up
            of several tools and resources that provide its functionality, which
            are all publicly available:
          </p>

          <Flex>
            <Button
              to="https://github.com/krishnanlab/PyGenePlexus"
              text="Package"
              icon={<FaBoxOpen />}
              tooltip="Perform analyses programmatically via Python, R, or command line"
              flip
            />
            <Button
              to="https://pygeneplexus.readthedocs.io/en/v2.0.2/"
              text="Docs"
              icon={<FaBook />}
              tooltip="Detailed information on how to use the package and how to interpret results"
              flip
            />
            <Button
              to="https://doi.org/10.1371/journal.pcbi.1011773"
              text="Paper"
              icon={<FaScroll />}
              tooltip="Detailed discussion of methods and background information"
              flip
            />
            <Button
              to="https://doi.org/10.5281/zenodo.14149956"
              text="Data"
              icon={<FaChartBar />}
              tooltip="Raw data behind the package and analyses"
              flip
            />
            <Button
              to="https://pygeneplexus.readthedocs.io/en/v2.0.2/notes/faqs.html"
              text="FAQs"
              icon={<FaQuestion />}
              tooltip="Detailed help on some frequently asked questions"
              flip
            />
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaScaleBalanced />}>
          Terms of Use
        </Heading>

        <Flex direction="column">
          <p>
            For the user's convenience, this web application saves certain
            information locally, such as recent analysis inputs. This data only
            exists locally on the user's device, and is not sent to the
            developers of GenePlexus or any other party.
          </p>
          <p>
            This web application may also track user behavior, such as
            navigation and clicks, using Google Analytics. These analytics
            services take significant steps to remove identifying information
            from the data they collect to ensure anonymity.
          </p>
          <p>
            The developers of GenePlexus pledge to use any information collected
            solely for the purposes of improving GenePlexus, and to never
            disclose any private, identifying information. By using this web
            application, you consent to these terms.
          </p>
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaHourglass />}>
          Legacy
        </Heading>

        <p className="center">
          This web app is a re-imagined version of the initial version of
          GenePlexus, which has been{" "}
          <Link to="https://pygeneplexus.readthedocs.io/en/latest/notes/faqs.html">
            shut down
          </Link>
          .
        </p>
      </Section>
    </>
  );
};

export default AboutPage;
