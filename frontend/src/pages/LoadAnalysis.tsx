import { FaArrowRight } from "react-icons/fa6";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const LoadAnalysis = () => {
  return (
    <>
      <Meta title="Load Analysis" />

      <Section>
        <Heading level={1} icon={<FaArrowRight />}>
          Load Analysis
        </Heading>
      </Section>
    </>
  );
};

export default LoadAnalysis;
