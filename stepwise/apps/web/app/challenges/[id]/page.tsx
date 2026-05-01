import { notFound } from "next/navigation";
import { fetchChallenge, type ChallengeDetail } from "@/lib/api";
import { ChallengeViewer } from "@/components/ChallengeViewer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await fetchChallenge(id);
    return { title: `${c.title} — StepWise` };
  } catch {
    return { title: "Challenge — StepWise" };
  }
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let challenge: ChallengeDetail;

  try {
    challenge = await fetchChallenge(id);
  } catch {
    notFound();
  }

  return <ChallengeViewer challenge={challenge} />;
}
