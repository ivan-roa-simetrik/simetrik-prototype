"use client";

import { useEffect, useState } from "react";

import { LoadingScreen } from "@/components/simetrik/loading-screen";
import { AgentWorkspace } from "@/components/simetrik/agent-workspace";
import { MotionPreset } from "@/components/ui/motion-preset";

const PROVISIONING_DURATION_MS = 2000;

let hasShownProvisioning = false;

export default function DashboardPage() {
  const [isProvisioning, setIsProvisioning] = useState(() => !hasShownProvisioning);

  useEffect(() => {
    if (!isProvisioning) return;
    hasShownProvisioning = true;
    const timer = setTimeout(() => setIsProvisioning(false), PROVISIONING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isProvisioning]);

  if (isProvisioning) {
    return <LoadingScreen />;
  }

  return (
    <MotionPreset fade transition={{ duration: 0.6 }}>
      <AgentWorkspace />
    </MotionPreset>
  );
}
