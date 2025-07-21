import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrganizationDisplay } from "@/components/organization-display";

const Home = () => {
  return (
    <div>
      <h1>Page</h1>
      <Link href="/dashboard">
        <Button variant={"default"}>
          <span> {"-->"} Dashboard (unprotected)</span>
        </Button>
      </Link>
      <Link href="/sign-in">
        {"-->"}
        <Button variant={"link"}>Sign-in (unprotected)</Button>
      </Link>
      <OrganizationDisplay />
    </div>
  );
};

export default Home;
