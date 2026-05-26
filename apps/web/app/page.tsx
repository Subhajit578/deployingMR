import { prismaClient } from "db/client";
import { config } from "dotenv"
config({ path: "../../packages/db/.env" })
export default async function Home() {
  const users = await prismaClient.user.findMany();
  return (
    <div>
      {JSON.stringify(users)}
    </div>
  )
}