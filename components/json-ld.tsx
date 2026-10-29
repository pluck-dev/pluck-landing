import { serializeJsonLd } from "@/lib/site";

/** Server-rendered structured data; `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
