import { Fullscreen } from "lucide-react";
import { FloatingPanel } from "./styled";
import { FlexRow } from "@/layout/styled";
import { setFullscreen, useGraphStore } from "./state";


const FloatControls = () => {

  const { fullscreen } = useGraphStore();
  const handleClick = () => {
    setFullscreen(!fullscreen);
  }

  return (
    <FloatingPanel>
      <FlexRow>
        <Fullscreen style={{ cursor: 'pointer' }} onClick={handleClick} />
      </FlexRow>
    </FloatingPanel>
  )
}

export default FloatControls;
