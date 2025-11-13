import images from "./images";

export const DEFAULT_AVATAR =
  images["avatar-ph.png"] || "/avatar-ph.png" || "/default_avatar.png";

const PLACEHOLDER_STEMS = [
  "avatar-ph",
  "avatar_ph",
  "avatarph",
  "default-avatar",
  "default_avatar",
  "default-user",
  "defaultuser",
  "defaulticon",
  "default-icon",
  "student",
  "student-icon",
  "student_icon",
  "male-user",
  "male_user",
  "female-user",
  "female_user",
  "male-icon",
  "maleicon",
  "female-icon",
  "femaleicon",
  "placeholder",
];

const normalizeFileStem = (value) => {
  if (!value || typeof value !== "string") return "";
  const sanitized = value.trim().toLowerCase();
  if (!sanitized) return "";

  const withoutQuery = sanitized.split(/[?#]/)[0];
  const fileName = withoutQuery.split("/").pop() || "";
  return fileName.replace(/\.[^.]+$/, "");
};

const looksLikePlaceholder = (value) => {
  const stem = normalizeFileStem(value);
  if (!stem) return true;
  return PLACEHOLDER_STEMS.some(
    (hint) =>
      stem === hint ||
      stem.startsWith(`${hint}-`) ||
      stem.startsWith(`${hint}_`)
  );
};

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
  if (existing && !looksLikePlaceholder(existing)) return existing;
  return DEFAULT_AVATAR;
};

export default resolveUserAvatar;
