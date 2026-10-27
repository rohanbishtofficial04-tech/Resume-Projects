import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { TID } from "@/constants/testIds";

export const OfflineBanner = () => {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      data-testid={TID.offlineBanner}
      className="fixed top-16 inset-x-0 z-30 bg-[color:var(--nf-danger)] text-white text-center py-2 text-xs font-brand tracking-[0.2em]"
    >
      <WifiOff className="inline h-3.5 w-3.5 mr-2 -mt-0.5" />
      You are offline. Some experiences may not respond.
    </div>
  );
};
