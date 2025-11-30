declare module 'html-to-docx' {
  interface DocxOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
      };
    };
    footer?: boolean;
    pageNumber?: boolean;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  function htmlToDocx(
    htmlString: string,
    headerHTMLString?: string | null,
    options?: DocxOptions
  ): Promise<Blob>;

  export default htmlToDocx;
}