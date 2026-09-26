import { Fullscreen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setFullscreen, useGraphStore } from "./state";

const FloatControls = () => {
  const { fullscreen } = useGraphStore();

  return (
    <div className="absolute right-[15px] bottom-[3px] z-99">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => setFullscreen(!fullscreen)}
        aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-pressed={fullscreen}
      >
        <Fullscreen className="size-4" />
      </Button>
    </div>
  );
};

export default FloatControls;
