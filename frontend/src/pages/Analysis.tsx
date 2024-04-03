import { FaMagnifyingGlassChart } from "react-icons/fa6";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const Analysis = () => {
  return (
    <>
      <Meta title="Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Analysis
        </Heading>
      </Section>
    </>
  );
};

export default Analysis;
