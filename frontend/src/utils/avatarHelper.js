import images from "./images";

const DEFAULT_GENERIC =
  images["avatar-ph.png"] || "/avatar-ph.png" || "/default_avatar.png";

const pickExistingAvatar = (user) => {
  if (!user) return null;
  return (
    user.avatarUrl ||
    user.avatar ||
    user.image ||
    user.img ||
    null
  );
};

export const resolveUserAvatar = (user) => {
  const existing = pickExistingAvatar(user);
  if (existing) return existing;
  return DEFAULT_GENERIC;
};

export default resolveUserAvatar;
