import fs from 'fs/promises';
import path from 'path';

const SRC_FOLDER = './fb-export';
const DIST_FOLDER = './dist';
const JSON_FILE = SRC_FOLDER + '/posts/posts_1.json';

const fb_posts = JSON.parse(
  await fs.readFile(new URL(JSON_FILE, import.meta.url))
);

const create_dir = async (post) => {
  const title = post.replace(/\n/g, ' | ')
    .replace(/\s+/g, ' ')
    .replace(/\W+/g, '-');
  const new_path = path.resolve(DIST_FOLDER, title);
  await fs.mkdir(new_path, { recursive: true });
  return new_path;
}

const copy_photos = (photos, new_path) => {
  return Promise.all(photos.map(photo => {
    const orig = path.resolve(SRC_FOLDER, photo.media.uri);
    const { base } = path.parse(orig);
    console.log([
      'COPY FILE:',
      `FROM: ${path.relative(process.cwd(), orig)}`,
      `TO: ${path.relative(process.cwd(), path.resolve(new_path, base))}`,
    ].join('\n'), '\n');
    return fs.copyFile(orig, path.resolve(new_path, base));
  }));
};

const process_posts = async (post) => {
  const new_path = await create_dir(post.data[0].post);
  await copy_photos(post.attachments[0].data, new_path);
};

if (Array.isArray(fb_posts)) {
  fb_posts.forEach(process_posts);
} else {
  process_posts(fb_posts);
}
