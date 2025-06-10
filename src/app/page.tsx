import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
})



  return (
    <main>
      <h1>Hello World</h1>

      {!session ? "not authenticated" : "Welcome" }


    </main>
  );
}