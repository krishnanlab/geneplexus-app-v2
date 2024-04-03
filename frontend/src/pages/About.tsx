import { FaPenNib } from "react-icons/fa6";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const About = () => {
  return (
    <>
      <Meta title="About" />

      <Section>
        <Heading level={1} icon={<FaPenNib />}>
          About
        </Heading>
      </Section>
    </>
  );
};

export default About;
