import { FaArrowLeft } from "react-icons/fa6";
import { MdBrokenImage } from "react-icons/md";
import { useLocation } from "react-router";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";

const NotFoundPage = () => {
  const { pathname, search, hash } = useLocation();

  return (
    <>
      <Meta title="Not Found" />

      <Section>
        <Heading level={1} icon={<MdBrokenImage />}>
          Not Found
        </Heading>

        <p className="center">
          The page you're looking for doesn't exist! Are you looking for the{" "}
          <Link to={`https://www.geneplexus.net${pathname}${search}${hash}`}>
            old GenePlexus?
          </Link>
        </p>

        <Button to="/" text="Home" icon={<FaArrowLeft />} flip />
      </Section>
    </>
  );
};

export default NotFoundPage;
