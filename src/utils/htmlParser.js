import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const contentDirectory = path.join(process.cwd(), 'content', 'articles');

export function getArticles() {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const articles = fileNames
    .filter(fileName => fileName.endsWith('.html'))
    .map(fileName => {
      const slug = fileName.replace(/\.html$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const $ = cheerio.load(fileContents);
      
      const title = $('title').text() || slug.replace(/-/g, ' ');
      const description = $('meta[name="description"]').attr('content') || 'An educational article.';

      return {
        slug,
        title,
        description,
        date: fs.statSync(fullPath).mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return articles;
}

export function getArticleData(slug) {
  const fullPath = path.join(contentDirectory, `${slug}.html`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(fileContents);

  const title = $('title').text() || slug.replace(/-/g, ' ');
  const description = $('meta[name="description"]').attr('content') || 'An educational article.';
  
  // Extract only the inner body HTML so it doesn't duplicate html/head tags
  const contentHtml = $('body').html() || fileContents;

  return {
    slug,
    title,
    description,
    contentHtml,
  };
}
