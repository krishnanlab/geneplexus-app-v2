import { FaMagnifyingGlassChart, FaUpload } from "react-icons/fa6";
import { useNavigate } from "react-router";
import type { Analysis } from "@/api/types";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";

const LoadAnalysis = () => {
  const navigate = useNavigate();

  return (
    <>
      <Meta title="Load Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Load Analysis
        </Heading>

        <UploadButton
          text="Upload"
          icon={<FaUpload />}
          accept={["application/json", ".json"]}
          tooltip="Upload previously saved analysis. "
          onUpload={async (file, filename) => {
            const text = await file.text();
            try {
              const json = JSON.parse(text) as Analysis;
              json.inputs.name ??= filename;
              /** send inputs and results to analysis page */
              navigate("/analysis", { state: json });
            } catch (error) {
              toast("Error parsing file", "error");
            }
          }}
        />
      </Section>
    </>
  );
};

export default LoadAnalysis;
