import { copyFile, mkdir, readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const SRC_FOLDER = "./fb-export/facebook-competitionmotorsport-2023-10-23-VETkcEEo";
const DIST_FOLDER = "./dist";

const create_dir = async (post) => {
  const title = encodeURIComponent(post.trim())
    .replace(/\./g, "")
    .replace(/(?:%0A)+/g, "_|_")
    .replace(/(?:%20)+/g, "_")
    .replace(/%[0-9A-Z]{2}/g, "")
    .split('_|_')
    .pop();
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
  const post_title = post.data?.[0]?.post ?? "Untitled";
  const post_photos = post.attachments?.[0]?.data;
  const new_path = await create_dir(post_title);
  await Promise.all(copy_photos(post_photos, new_path));
};

const fb_posts = JSON.parse(await readFile(SRC_FOLDER + "/this_profile's_activity_across_facebook/posts/profile_posts_1.json"));
if (Array.isArray(fb_posts)) {
  fb_posts.forEach(process_posts);
} else {
  process_posts(fb_posts);
}
