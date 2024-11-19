import {
  FaArrowUpRightFromSquare,
  FaBook,
  FaBoxOpen,
  FaChartBar,
  FaEye,
  FaHourglass,
  FaLightbulb,
  FaPenNib,
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
              to="https://pygeneplexus.readthedocs.io/en/main/"
              text="Docs"
              icon={<FaBook />}
              tooltip="Detailed information on how to use the package and how to interpret results"
              flip
            />
            <Button
              to="https://academic.oup.com/bioinformatics/article/36/11/3457/5780279"
              text="Paper"
              icon={<FaScroll />}
              tooltip="Detailed discussion of methods and background information"
              flip
            />
            <Button
              to="https://zenodo.org/records/6383205"
              text="Data"
              icon={<FaChartBar />}
              tooltip="Raw data behind the package and analyses"
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
          GenePlexus, which is still accessible (for a limited time) here:
        </p>

        <Button
          to={import.meta.env.VITE_OLD_URL}
          text="Old Site"
          icon={<FaArrowUpRightFromSquare />}
        />
      </Section>
    </>
  );
};

export default AboutPage;
