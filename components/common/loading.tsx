import { cn } from "@/lib/utils";
import { TextShimmer } from "../motion-primitives/text-shimmer";

interface LoadingProps {
  text?: string;
  classname?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "Generating...",
  classname,
}) => {
  return (
    <TextShimmer className={cn("font-mono text-sm", classname)} duration={1}>
      {text}
    </TextShimmer>
  );
};
