/**
 * page.tsx — Server Component shell.
 *
 * Data is fetched here (server-side) via the data service.
 * The interactive dashboard is a separate Client Component so
 * useState / useEffect still work.
 */

import { getDashboardData } from "@/lib/data";
import Dashboard from "./dashboard";

export default async function Home() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
