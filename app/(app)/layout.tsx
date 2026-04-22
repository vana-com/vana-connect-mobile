import { BottomTabNav } from "@/components/layout/bottom-tab-nav";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { PermissionModal } from "@/components/permissions/permission-modal";
import { SettingsSheetWrapper } from "@/components/settings/settings-sheet-wrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <div className="relative flex h-full min-h-screen flex-col pb-tab sm:pb-tab">
        {children}
        <BottomTabNav />
        <PermissionModal />
        <SettingsSheetWrapper />
      </div>
    </PhoneFrame>
  );
}
