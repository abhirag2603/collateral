import { MongoClient } from "mongodb";
const uri = "mongodb+srv://abhirag4169_db_user:pofVhZxklVDQdDAs@collateral01.7g0rpz6.mongodb.net/collateral?retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("collateral");
  
  const users = await db.collection("users").find({}).toArray();
  console.log("USERS:", JSON.stringify(users, null, 2));

  const financial = await db.collection("financialdatas").find({}).toArray();
  console.log("FINANCIAL:", JSON.stringify(financial, null, 2));

  const goals = await db.collection("goals").find({}).toArray();
  console.log("GOALS:", JSON.stringify(goals, null, 2));
  
  await client.close();
}
run().catch(console.error);
