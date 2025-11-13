import { useEffect, useMemo, useState } from "react";
import resolveUserAvatar, {
  DEFAULT_AVATAR,
} from "../utils/avatarHelper";

const canPreload = typeof Image === "function";

const useOptimizedAvatar = (user) => {
  const targetSrc = useMemo(
    () => resolveUserAvatar(user) || DEFAULT_AVATAR,
    [user]
  );

  const [avatarSrc, setAvatarSrc] = useState(targetSrc);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (!targetSrc) {
      setAvatarSrc(DEFAULT_AVATAR);
      setAvatarLoading(false);
      return;
    }

    if (avatarSrc === targetSrc) {
      setAvatarLoading(false);
      return;
    }

    if (!canPreload) {
      setAvatarSrc(targetSrc);
      setAvatarLoading(false);
      return;
    }

    let cancelled = false;
    setAvatarLoading(true);
    const preload = new Image();
    preload.src = targetSrc;

    const finalize = () => {
      if (cancelled) return;
      setAvatarSrc(targetSrc);
      setAvatarLoading(false);
    };

    preload.onload = finalize;
    preload.onerror = finalize;

    return () => {
      cancelled = true;
    };
  }, [targetSrc, avatarSrc]);

  return {
    avatarSrc: avatarSrc || DEFAULT_AVATAR,
    avatarLoading,
  };
};

export default useOptimizedAvatar;
