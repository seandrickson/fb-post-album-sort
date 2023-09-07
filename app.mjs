import { copyFile, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import fb_posts from "./fb-export/posts/profile_posts_1.json" assert { type: "json" };
const SRC_FOLDER = "./fb-export";
const DIST_FOLDER = "./dist";

const create_dir = async (post) => {
  const title = post
    .trim()
    .replace(/\n/g, " | ")
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9\s-|]+/g, "");
  const new_path = resolve(DIST_FOLDER, title);
  await mkdir(new_path, { recursive: true });
  return new_path;
};

const copy_photos = (photos, new_path) =>
  photos.map((photo) =>
    copyFile(
      resolve(SRC_FOLDER, photo.media.uri),
      resolve(new_path, basename(photo.media.uri))
    )
  );

const process_posts = async (post) => {
  const post_title = post.data[0]?.post ?? "Untitled";
  const post_photos = post.attachments[0]?.data;
  const new_path = await create_dir(post_title);
  await Promise.all(copy_photos(post_photos, new_path));
};

if (Array.isArray(fb_posts)) {
  fb_posts.forEach(process_posts);
} else {
  process_posts(fb_posts);
}
