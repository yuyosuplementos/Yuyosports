"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export function Icon({
  icon,
  className,
  spin,
}: {
  icon: IconProp;
  className?: string;
  spin?: boolean;
}) {
  return <FontAwesomeIcon icon={icon} className={className} spin={spin} fixedWidth={false} />;
}
