import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrganizationDisplay } from "@/components/organization-display"

const Home = () => {
  return (
    <div>
      <h1>Page</h1>
      <Button
      variant={"default"}
      >
      <Link href="/dashboard">
      <span> {"-->"} Dashboard (unprotected)</span>
      </Link>
      </Button>
      <Button
      variant={"link"}>
      <Link href="/sign-in">{"-->"} Sign-in (unprotected)</Link>
      </Button>
      <OrganizationDisplay />
    </div>
  )
}

export default Home