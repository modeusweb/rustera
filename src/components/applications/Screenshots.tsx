import type { AppScreenshot } from "@/types/domain";
import { MESSAGES } from "@/lib/constants/messages";
import { isAllowedRemoteImage } from "@/lib/validation/image-url";
import { ScreenshotGallery } from "./ScreenshotGallery";

export function Screenshots({ items, appName }: { items: AppScreenshot[]; appName: string }) {
  const valid = items.filter((item) => isAllowedRemoteImage(item.url));
  if (valid.length === 0) {
    return <p className="text-sm text-muted">{MESSAGES.app.noScreenshots}</p>;
  }

  return <ScreenshotGallery items={valid} appName={appName} />;
}
