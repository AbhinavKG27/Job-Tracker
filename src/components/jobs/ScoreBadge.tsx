import { getScoreBadgeColor } from "@/lib/matchScore";

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const { bg, text } = getScoreBadgeColor(score);
  return <span className={`${bg} ${text} text-xs font-bold px-2 py-0.5 rounded-full`}>{score}%</span>;
};

export default ScoreBadge;
