import {
  copyFile,
  mkdir,
  readFile
} from 'node:fs/promises';
import {
  parse,
  resolve
} from 'node:path';

const SRC_FOLDER = './fb-export';
const DIST_FOLDER = './dist';

const fb_posts = JSON.parse(
  await readFile(
    new URL(`${SRC_FOLDER}/posts/posts_1.json`, import.meta.url)
  )
);

const create_dir = async (post) => {
  const title = post.replace(/\n/g, ' | ')
    .replace(/\s+/g, ' ')
    .replace(/\W+/g, '-');
  const new_path = resolve(DIST_FOLDER, title);
  await mkdir(new_path, { recursive: true });
  return new_path;
};

const copy_photos = async (photos, new_path) => await photos.map((photo) => {
  const orig = resolve(SRC_FOLDER, photo.media.uri);
  const { base } = parse(orig);
  return copyFile(orig, resolve(new_path, base));
});

const process_posts = async (post) => {
  const post_title = post.data[0]?.post;
  const post_photos = post.attachments[0]?.data;
  if (!post_title) return;
  const new_path = await create_dir(post_title);
  await copy_photos(post_photos, new_path);
};

if (Array.isArray(fb_posts)) {
  fb_posts.forEach(process_posts);
} else {
  process_posts(fb_posts);
}
