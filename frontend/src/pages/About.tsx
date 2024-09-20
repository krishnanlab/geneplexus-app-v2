import {
  FaArrowUpRightFromSquare,
  FaHourglass,
  FaPenNib,
  FaScaleBalanced,
} from "react-icons/fa6";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
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
        <Heading level={2} icon={<FaScaleBalanced />}>
          Terms of Use
        </Heading>

        <p>
          For the user's convenience, this web application saves certain
          information locally, such as recent analysis inputs. This data only
          exists locally on the user's device, and is not sent to the developers
          of GenePlexus or any other party.
        </p>
        <p>
          This web application may also track user behavior, such as navigation
          and clicks, using Google Analytics. These analytics services take
          significant steps to remove identifying information from the data they
          collect to ensure anonymity.
        </p>
        <p>
          The developers of GenePlexus pledge to use any information collected
          solely for the purposes of improving GenePlexus, and to never disclose
          any private, identifying information. By using this web application,
          you consent to these terms.
        </p>
      </Section>

      <Section>
        <Heading level={2} icon={<FaHourglass />}>
          Legacy
        </Heading>

        <p className="center">
          This webapp is a reimagined version of the initial version of
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
