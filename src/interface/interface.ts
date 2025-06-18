export interface IPagination {
  page: number;
  previous_page: any;
  next_page: string | null;
  per_page: number;
  page_count: number;
  count: number;
  sort_by: string;
  sort_order: string;
}

export interface IArticle {
  id: number;
  url: string;
  html_url: string;
  author_id: number;
  comments_disabled: boolean;
  draft: boolean;
  promoted: boolean;
  position: number;
  vote_sum: number;
  vote_count: number;
  section_id: number;
  created_at: string;
  updated_at: string;
  name: string;
  title: string;
  source_locale: string;
  locale: string;
  outdated: boolean;
  outdated_locales: any[];
  edited_at: string;
  user_segment_id: any;
  permission_group_id: number;
  content_tag_ids: any[];
  label_names: any[];
  body: string;
}

export interface IArticleResponse extends IPagination {
  articles: IArticle[];
}

export interface IScrapeConfig {
  latestUpdateTime: number;
  latestPage: number;
}

export interface IArticleExportResponse {
  success: boolean;
  article: {
    id: number;
    slug: string;
    url: string;
    path: string;
    content: string;
  };
}

export interface IVectorStoreInput {
  id: string;
  content: string;
}
